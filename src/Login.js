import React, { useState } from 'react';
import { Button, Input, Form, FormGroup, Label } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [matricula, setMatricula] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleInputChange = (event) => {
    setMatricula(event.target.value);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    console.log('Matrícula:', matricula);
    const repoOwner = 'tizula1';
    const repoName = 'auto-fca';
    const folderName = `Registros/${matricula}`;
    const content = btoa('Este é o arquivo README para a matrícula ' + matricula);
    const token = process.env.REACT_APP_GITHUB_TOKEN;
    console.log('GITHUB_TOKEN:', process.env.REACT_APP_GITHUB_TOKEN);
    const checkFolderUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderName}`;
    const defaultFolderUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/Registros/default`;
    try {
      const response = await fetch(checkFolderUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        console.log('Pasta já existe, seguindo para a próxima tela...');
        setLoading(false);
        navigate('/app', { state: { matricula, token } });
      } else if (response.status === 404) {
        console.log('Criando nova pasta...');
        const createFolderResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderName}/README.md`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'AutoFCA',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Criando README.md para a matrícula ${matricula}`,
            committer: {
              name: "tizula1",
              email: "souza.gui2002@gmail.com"
            },
            author: {
              name: "tizula1",
              email: "souza.gui2002@gmail.com"
            },
            content: content
          })
        });
        if (createFolderResponse.ok) {
          console.log('Pasta criada com sucesso!');
          const defaultFolderResponse = await fetch(defaultFolderUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (defaultFolderResponse.ok) {
            const defaultFiles = await defaultFolderResponse.json();
            for (const file of defaultFiles) {
              const fileName = file.name;
              const fileContentResponse = await fetch(file.download_url);
              const fileContent = await fileContentResponse.text();
              const encodedContent = btoa(fileContent);
              const newFilePath = `${folderName}/${fileName}`;
              const createFileResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${newFilePath}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'User-Agent': 'AutoFCA',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  message: `Copiando arquivo ${fileName} para a matrícula ${matricula}`,
                  committer: {
                    name: 'Seu Nome',
                    email: 'seu-email@exemplo.com'
                  },
                  content: encodedContent
                })
              });

              if (!createFileResponse.ok) {
                console.error(`Erro ao copiar o arquivo ${fileName}:`, createFileResponse.status);
              }
            }
            console.log('Todos os arquivos copiados com sucesso!');
            setLoading(false);
            navigate('/app', { state: { matricula, token }});
          } else {
            console.error('Erro ao obter o conteúdo da pasta default:', defaultFolderResponse.status);
            setLoading(false);
          }
        } else {
          console.error('Erro ao criar a pasta:', createFolderResponse.status);
          setLoading(false);
        }
      } else {
        console.error('Erro ao verificar a pasta:', response.status);
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro:', error);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Intelbras <br /> Auto FCA (BETA)</h2>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="matricula">Matrícula:</Label>
          <Input
            type="text"
            id="matricula"
            value={matricula}
            onChange={handleInputChange}
            placeholder="Digite sua matrícula"
            required
            disabled={loading}
            autoComplete="off"
          />
        </FormGroup>
        <Button color="primary" type="submit" disabled={loading}>Próximo</Button>
      </Form>

      {loading && (
        <div className="overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default Login;
