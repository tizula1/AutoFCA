import './App.css';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Button } from 'reactstrap';
import AutosizeTextarea from 'react-textarea-autosize';
import { useLocation } from 'react-router-dom';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/autocomplete';
import 'bootstrap/dist/css/bootstrap.min.css';
import sunIcon from './assets/sun.png';
import moonIcon from './assets/moon.png';


function App() {
  const toggleTheme = () => {
    document.body.classList.toggle('dark-theme');
    setIsDarkTheme(!isDarkTheme);
  };
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const location = useLocation();
  const matricula = location.state?.matricula;
  const token = location.state?.token;
  const urlGit = `https://api.github.com/repos/tizula1/auto-fca/contents/Registros/${matricula}`;
  const [text, setText] = useState('');
  const [valorSelecionado, setValorSelecionado] = useState('');
  const [valorSelecionado2, setValorSelecionado2] = useState('');
  const [opcoesCausa, setOpcoesCausa] = useState([]);
  const [opcoesFato, setOpcoesFato] = useState([]);
  const [opcoesEquips, setOpcoesEquips] = useState([]);
  const [opcoesConex, setOpcoesConex] = useState([]);
  const [equipamentos, setEquipamentos] = useState([{}]);
  const [conexoes, setConexoes] = useState([{}]);
  const [equipamentoValues, setEquipamentoValues] = useState([]);
  const [conexaoValues, setConexaoValues] = useState([]);
  var originalValue = '';
  const handleCloseMessage = () => {
    setMensagem('');
  };
  const cacheFetch = async (url, cacheKey, token) => {
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    const cacheExpiration = 20 * 60 * 1000;
    if (cachedData && cachedTimestamp && (Date.now() - cachedTimestamp < cacheExpiration)) {
      return JSON.parse(cachedData);
    }
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'AutoFCA',
      }
    });
    if (!response.ok) throw new Error("Erro ao buscar conteúdo do arquivo");
    const data = await response.json();
    const decodedData = atob(data.content);
    const utf8Data = decodeURIComponent(escape(decodedData));
    const jsonData = JSON.parse(utf8Data);
    localStorage.setItem(cacheKey, JSON.stringify(jsonData));
    localStorage.setItem(`${cacheKey}_timestamp`, Date.now());

    return jsonData;
  };
  $("#valor3")
    .on("select", function (event, ui) {
      if (ui && ui.item && $(".textarea").val() != ui.item.value) {
        $(".textarea").val($(".textarea").val() + " " + ui.item.value);
      }
    })
    .autocomplete({
      minLength: 3,
      multiple: true,
      source: async function (request, response) {
        try {
          const jsonData = await cacheFetch(urlGit + '/acoes.json', 'acoes', token);
          response($.ui.autocomplete.filter(jsonData.acoes, extractLast(request.term)));
        } catch (error) {
          console.error("Erro ao buscar dados de ações:", error);
        }
      },
      open: function () {
        var caretPos = getCaretCoordinates(this, this.selectionEnd);
        $(".ui-autocomplete").css({
          top: caretPos.top + $(this).scrollTop() + $(this).offset().top,
          left: caretPos.left + $(this).offset().left
        });
        var autocomplete = $(this).data("ui-autocomplete");
        if (autocomplete && autocomplete.menu && autocomplete.menu.element) {
          var firstItem = autocomplete.menu.element.children().first();
          firstItem.addClass("ui-state-focus");
          autocomplete.menu.focus(null, firstItem);
        }
      },
      focus: function (event, ui) {
        $(".ui-state-focus").removeClass("ui-state-focus");
        $(event.target).data("ui-autocomplete").menu.element.children().first().addClass("ui-state-focus");
        return false;
      },
      select: function (event, ui) {
        if (ui && ui.item) {
          var lastTerm = extractLast(this.value);
          this.value = this.value.substring(0, this.value.length - lastTerm.length);
          insertAtCaret(this, ui.item.value + `\n`);
          $(this).trigger('focusout');
          event.preventDefault();
          return false;
        }
      },
      close: function (event, ui) {
        this.value = originalValue + this.value;
        $(this).autocomplete("option", "minLength", 3);
      }
    });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fatosData = await cacheFetch(urlGit + '/fatos.json?token=' + token, 'fatos', token);
        const opcoesFatos = fatosData.fatos.map(item => ({
          value: item,
          label: item
        }));
        setOpcoesFato(opcoesFatos);
        const causasData = await cacheFetch(urlGit + '/causas.json?token=' + token, 'causas', token);
        const opcoesCausas = causasData.causas.map(item => ({
          value: item,
          label: item
        }));
        setOpcoesCausa(opcoesCausas);
        const equipsData = await cacheFetch(urlGit + '/equipamentos.json?token=' + token, 'equipamentos', token);
        const opcoesEquips = equipsData.equipamentos.map(item => ({
          value: item,
          label: item
        }));
        setOpcoesEquips(opcoesEquips);
        const conexoesData = await cacheFetch(urlGit + '/conexoes.json?token=' + token, 'conexoes', token);
        const opcoesConex = conexoesData.conexoes.map(item => ({
          value: item,
          label: item
        }));
        setOpcoesConex(opcoesConex);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };
    fetchData();
  }, [token]);
  function getCaretCoordinates(input, selectionPoint) {
    var context = document.createElement("div");
    context.style.position = "relative";
    context.style.visibility = "hidden";
    context.style.whiteSpace = "pre-wrap";
    context.style.wordWrap = "break-word";
    context.style.width = input.offsetWidth + "px";
    context.style.font = getComputedStyle(input).font;
    document.body.appendChild(context);


    context.textContent = input.value.substring(0, selectionPoint);
    var span = document.createElement("span");
    span.textContent = input.value.substring(selectionPoint) || ".";
    context.appendChild(span);

    var coordinates = {
      top: span.offsetTop + span.offsetHeight + 10,
      left: span.offsetLeft
    };
    document.body.removeChild(context);

    return coordinates;
  };
  function split(val) {
    return val.split(/[\s\n]+/);
  };
  function extractLast(term) {
    return split(term).pop();
  };
  function insertAtCaret(input, text) {
    var scrollPos = input.scrollTop;
    var pos = 0;
    var browser = ((input.selectionStart || input.selectionStart == '0') ?
      "ff" : (document.selection ? "ie" : false));
    if (browser == "ie") {
      input.focus();
      var range = document.selection.createRange();
      range.moveStart('character', -input.value.length);
      pos = range.text.length;
    }
    else if (browser == "ff") pos = input.selectionStart;

    var front = (input.value).substring(0, pos);
    var back = (input.value).substring(pos, input.value.length);
    input.value = front + text + back;
    pos = pos + text.length;
    if (browser == "ie") {
      input.focus();
      var range = document.selection.createRange();
      range.moveStart('character', -input.value.length);
      range.moveStart('character', pos);
      range.moveEnd('character', 0);
      range.select();
    }
    else if (browser == "ff") {
      input.selectionStart = pos;
      input.selectionEnd = pos;
      input.focus();
    }
    input.scrollTop = scrollPos;
  };
  const clearFields = () => {
    setEquipamentoValues(equipamentoValues.map(() => null));
    setConexaoValues(conexaoValues.map(() => null));
    setValorSelecionado(null);
    setValorSelecionado2(null);
    setText('');
  };
  const handleChange = (novoValor) => {
    setValorSelecionado(novoValor);
  };
  const handleChange2 = (novoValor2) => {
    setValorSelecionado2(novoValor2);
  };
  const handleChange3 = (event) => {
    setText(event.target.value);
  };
  const handleCopy = () => {
    let values = '';

    for (let i = 0; i < Math.max(equipamentoValues.length, conexaoValues.length); i++) {
      if (equipamentoValues[i]) {
        values += equipamentoValues[i].value + " ";
      }
      if (conexaoValues[i]) {
        values += conexaoValues[i].value + " ";
      }
    }

    const div1Value = document.getElementById('valor1').textContent;
    const div2Value = document.getElementById('valor2').textContent;
    const div3Value = document.getElementById('valor3').textContent;
    const textToCopy = `Cenário:\n${values}\n\nFato:\n${div1Value}\n\nCausa:\n${div2Value}\n\nAção:\n${div3Value}`;

    navigator.clipboard.writeText(textToCopy);
  }
  const addEquipamento = () => {
    setEquipamentos([...equipamentos, {}]);
    setEquipamentoValues([...equipamentoValues, null]);
  };
  const removeEquipamento = () => {
    if (equipamentos.length > 1) {
      setEquipamentos(equipamentos.slice(0, -1));
      setEquipamentoValues(equipamentoValues.slice(0, -1));
    } else {
      alert("Não há mais equipamentos para remover.");
    }
  };
  const addConexao = () => {
    setConexoes([...conexoes, {}]);
    setConexaoValues([...conexaoValues, null]);
  };
  const removeConexao = () => {
    if (conexoes.length > 1) {
      setConexoes(conexoes.slice(0, -1));
      setConexaoValues(conexaoValues.slice(0, -1));
    } else {
      alert("Não há mais conexões para remover.");
    }
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      return false
    }
  };
  const adicionarNovasLinhas = async () => {
    const novoFato = valorSelecionado?.value || '';
    const novaCausa = valorSelecionado2?.value || '';
    const novaAcao = text.trim();
    const novoEquipamento = equipamentoValues.map(e => e?.value).join(', ');
    const novaConexao = conexaoValues.map(c => c?.value).join(', ');
    setLoading(true);
    setMensagem('');
    try {
      const acoesResponse = novaAcao ? await atualizarAcoes(novaAcao) : null;
      const equipamentosResponse = novoEquipamento ? await atualizarArquivo(`${urlGit}/equipamentos.json`, 'equipamentos', novoEquipamento) : null;
      const conexoesResponse = novaConexao ? await atualizarArquivo(`${urlGit}/conexoes.json`, 'conexoes', novaConexao) : null;
      const causasResponse = novaCausa ? await atualizarArquivo(`${urlGit}/causas.json`, 'causas', novaCausa) : null;
      const fatosResponse = novoFato ? await atualizarArquivo(`${urlGit}/fatos.json`, 'fatos', novoFato) : null;
    } catch (error) {
      console.error("Erro ao adicionar novas linhas:", error);
      setMensagem('Erro ao adicionar novas linhas.');
    } finally {
      setLoading(false);
    }
  };
  const atualizarAcoes = async (acoes) => {
    const acoesSeparadas = acoes.split(/;\s*|\.\s*/);
    for (const acao of acoesSeparadas) {
      const acaoTrimmed = acao.trim();
      if (acaoTrimmed) {
        await atualizarArquivo(`${urlGit}/acoes.json`, 'acoes', acaoTrimmed);
      }
    }
  };
  const atualizarArquivo = async (urlArquivo, campoArray, novoConteudo) => {
    const response = await fetch(urlArquivo, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Erro ao buscar conteúdo do arquivo");
    const data = await response.json();
    const decodedData = atob(data.content);
    const utf8Data = decodeURIComponent(escape(decodedData));
    let jsonData = JSON.parse(utf8Data);
    if (!Array.isArray(jsonData[campoArray])) {
      throw new Error(`Formato inválido: '${campoArray}' deve ser um array`);
    }
    const jaExiste = novoConteudo && jsonData[campoArray].some(item => item === novoConteudo);
    if (!jaExiste && novoConteudo) {
      jsonData[campoArray].push(novoConteudo);
      const novoTexto = JSON.stringify(jsonData, null, 2);
      const updateResponse = await fetch(urlArquivo, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Adicionando novo conteúdo em ${campoArray}`,
          content: btoa(unescape(encodeURIComponent(novoTexto))),
          sha: data.sha,
          committer: {
            name: "tizula1",
            email: "souza.gui2002@gmail.com"
          },
          author: {
            name: "tizula1",
            email: "souza.gui2002@gmail.com"
          },
        })
      });

      if (!updateResponse.ok) throw new Error("Erro ao atualizar o arquivo");
      setMensagem('Dados adicionados com sucesso!');
    } else {
      setMensagem(`O conteúdo '${novoConteudo}' já existe`);
    }
  };
  const lightThemeStyles = {
    control: (styles) => ({
      ...styles,
      backgroundColor: '#FFFFFF',
      color: '#000000',
      borderColor: '#CCCCCC',
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: '#FFFFFF',
      color: '#000000',
    }),
    option: (styles, { isFocused }) => ({
      ...styles,
      backgroundColor: isFocused ? '#F0F0F0' : '#FFFFFF',
      color: '#000000',
    }),
    singleValue: (styles) => ({
      ...styles,
      color: '#000000',
    }),
  };
  const darkThemeStyles = {
    control: (styles, { isFocused }) => ({
      ...styles,
      backgroundColor: '#1E1E1E',
      color: '#FFFFFF',
      borderColor: isFocused ? '#02aa4d' : '#02aa4d',
      boxShadow: 'none',
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: '#1E1E1E',
      color: '#FFFFFF',
    }),
    option: (styles, { isFocused }) => ({
      ...styles,
      backgroundColor: isFocused ? '#3B3B3B' : '#1E1E1E',
      color: '#FFFFFF',
    }),
    singleValue: (styles) => ({
      ...styles,
      color: '#FFFFFF',
    }),
    input: (styles) => ({
      ...styles,
      color: '#FFFFFF',
    }),
  };
  return (
    <div className='divFca'>
      <button onClick={toggleTheme} className="theme-toggle-button">
        <img
          src={isDarkTheme ? sunIcon : moonIcon}
          alt={isDarkTheme ? 'Trocar para tema claro' : 'Trocar para tema escuro'}
          style={{ width: '24px', height: '24px' }}
        />
      </button>
      <div>
        {loading && (
          <div className="overlay">
            <div className="spinner"></div>
          </div>
        )}
        {mensagem && (
          <div className="modal-overlay" onClick={handleCloseMessage}>
            <div className="modal-message">
              {mensagem}
            </div>
          </div>
        )}

      </div>
      <div className='header'>
        <img className="imgHeader" src="https://upload.wikimedia.org/wikipedia/commons/2/2b/Logomarca_Intelbras_verde.png" />
      </div>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-4 flex-column align-items-start'>
            <div className='alignScene'>
              <div className='divEquips'>
                {equipamentos.map((select, index) => (
                  <CreatableSelect
                    styles={isDarkTheme ? darkThemeStyles : lightThemeStyles}
                    key={index}
                    isClearable
                    placeholder="Equipamentos"
                    className="creatableSelect"
                    value={equipamentoValues[index]}
                    onChange={value => {
                      const newValues = [...equipamentoValues];
                      newValues[index] = value;
                      setEquipamentoValues(newValues);
                    }}
                    options={opcoesEquips}
                    formatCreateLabel={(inputValue) => `Criar "${inputValue}"`}
                  />
                ))}
                <button onClick={addEquipamento} className='botaoCenario'>Adicionar equipamento</button>
                <button onClick={removeEquipamento} className='botaoCenario'>Remover equipamento</button>
              </div>
              <div className='divConexoes'>
                {conexoes.map((select, index) => (
                  <CreatableSelect
                    styles={isDarkTheme ? darkThemeStyles : lightThemeStyles}
                    key={index}
                    isClearable
                    placeholder="Conexões"
                    className="creatableSelect"
                    value={conexaoValues[index]}
                    onChange={value => {
                      const newValues = [...conexaoValues];
                      newValues[index] = value;
                      setConexaoValues(newValues);
                    }}
                    options={opcoesConex}
                    formatCreateLabel={(inputValue) => `Criar "${inputValue}"`}
                  />
                ))}
                <button onClick={addConexao} className='botaoCenario'>Adicionar conexão</button>
                <button onClick={removeConexao} className='botaoCenario'>Remover conexão</button>
              </div>
            </div>
          </div>
          <div className='col-lg-8'>
            <div className=''>
              <div id='valor1'>
                <CreatableSelect
                  styles={isDarkTheme ? darkThemeStyles : lightThemeStyles}
                  formatCreateLabel={(inputValue) => `Adicionar: "${inputValue}"`}
                  isClearable
                  placeholder="Fato:"
                  value={valorSelecionado}
                  onChange={handleChange}
                  options={opcoesFato}
                />
                <p ></p>
              </div>
              <div id='valor2'>
                <CreatableSelect
                  styles={isDarkTheme ? darkThemeStyles : lightThemeStyles}
                  formatCreateLabel={(inputValue) => `Adicionar: "${inputValue}"`}
                  isClearable
                  placeholder="Causa:"
                  value={valorSelecionado2}
                  onChange={handleChange2}
                  options={opcoesCausa}
                />
              </div>
            </div>
            <div className='divAcao' >
              <AutosizeTextarea id="valor3" onChange={handleChange3} value={text} className='textarea' minRows={10} tabIndex="1" placeholder=' Ação: ' onKeyDown={handleKeyDown} />
            </div>
          </div>
        </div>
        <div className='divButton' >
          <div>
            <Button color="success" onClick={adicionarNovasLinhas}>Adicionar Dados</Button>
          </div>
          <div>
            <Button color="success" onClick={clearFields} className="me-3">Limpar tela</Button>
          </div>
          <div>
            <Button color="success" onClick={handleCopy} >Copiar dados</Button>
          </div>
        </div>
      </div>
    </div>

  );
}

export default App;
