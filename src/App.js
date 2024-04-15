import './App.css';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Button } from 'reactstrap';
import AutosizeTextarea from 'react-textarea-autosize';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/autocomplete';
import dataAcao from '../src/scripts/redes/acao.json';
import dataCausa from '../src/scripts/redes/causa.json';
import dataFato from '../src/scripts/redes/fato.json';


function App() {
  function getCaretCoordinates(input, selectionPoint) {
    var context = document.createElement("div");
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
      top: span.offsetTop + span.offsetHeight,
      left: span.offsetLeft
    };
    document.body.removeChild(context);

    return coordinates;
  }
  function split(val) {
    return val.split(/;\s*/);
  }
  function extractLast(term) {
    return split(term).pop();
  }
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
  }

  var originalValue = '';
  $("#valor3")
    .on("select", function (event, ui) {
      if (ui && ui.item && $(".textarea").val() != ui.item.value) {
        $(".textarea").val($(".textarea").val() + " " + ui.item.value);
      }
    })
    .autocomplete({
      minLength: 3,
      multiple: true,
      source: function (request, response) {
        $.ajax({
          url: "https://tizula1.github.io/auto-fca/redes/acao.json", // Substitua por sua URL
          dataType: "json",
          data: {
            term: extractLast(request.term)
          },
          success: function (data) {
            response($.ui.autocomplete.filter(data.acoes, extractLast(request.term)));
          }
        });
      },
      open: function () {
        var caretPos = getCaretCoordinates(this, this.selectionEnd);
        $(".ui-autocomplete").css({
          top: caretPos.top + $(this).scrollTop() + $(this).offset().top,
          left: caretPos.left + $(this).offset().left
        });
      },
      focus: function (event, ui) {
        return false;
      },
      select: function (event, ui) {
        if (ui && ui.item) {
          var cursorPosition = this.selectionStart;
          var lastSpacePosition = this.value.lastIndexOf('\n', cursorPosition);
          var textBeforeCursor = this.value.substring(0, lastSpacePosition + 1);
          var textAfterCursor = this.value.substring(cursorPosition);
          this.value = textBeforeCursor + ui.item.value + ";" + "\n" + textAfterCursor;
          $(this).trigger('focusout');
          event.preventDefault();
          return false;
        }
      },
      close: function (event, ui) {
        this.value = originalValue + this.value;
      }
    });



  const [text, setText] = useState('');
  const [valorSelecionado, setValorSelecionado] = useState('');
  const [valorSelecionado2, setValorSelecionado2] = useState('');

  const [opcoesCausa, setOpcoesCausa] = useState([]);
  const [opcoesFato, setOpcoesFato] = useState([]);
  const [opcoesEquips, setOpcoesEquips] = useState([]);
  const [opcoesConex, setOpcoesConex] = useState([]);

  useEffect(() => {
    $.ajax({
      url: 'https://tizula1.github.io/auto-fca/redes/fato.json',
      method: 'GET',
      success: function (data) {
        const opcoes = data.fatos.map(item => ({
          value: item,
          label: item
        }));
        setOpcoesFato(opcoes);
      }
    });
    $.ajax({
      url: 'https://tizula1.github.io/auto-fca/redes/causa.json',
      method: 'GET',
      success: function (data) {
        const opcoes = data.causas.map(item => ({
          value: item,
          label: item
        }));
        setOpcoesCausa(opcoes);
      }
    });
    $.ajax({
      url: 'https://tizula1.github.io/auto-fca/redes/equip.json',
      method: 'GET',
      success: function (data) {
        const opcoes = data.equipamentos.map(item => ({
          value: item,
          label: item
        }));
        setOpcoesEquips(opcoes);
      }
    });
    $.ajax({
      url: 'https://tizula1.github.io/auto-fca/redes/conex.json',
      method: 'GET',
      success: function (data) {
        const opcoes = data.conexoes.map(item => ({
          value: item,
          label: item
        }));
        setOpcoesConex(opcoes);
      }
    });


  }, []);

  const refreshPage = () => {
    window.location.reload();
  }

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
  const [equipamentos, setEquipamentos] = useState([{}]);
  const [conexoes, setConexoes] = useState([{}]);
  const [equipamentoValues, setEquipamentoValues] = useState([]);
  const [conexaoValues, setConexaoValues] = useState([]);

  const addEquipamento = () => {
    setEquipamentos([...equipamentos, {}]);
    setEquipamentoValues([...equipamentoValues, null]);
  };

  const addConexao = () => {
    setConexoes([...conexoes, {}]);
    setConexaoValues([...conexaoValues, null]);
  };
  return (

    <div className='divFca'>
      <div className='header'>
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2b/Logomarca_Intelbras_verde.png" />
      </div>
      <div className='divPrincipal'>
        <div className='divEsq'>
          <div className='divCenario'>
            <p className='sceneText'>Cenário:</p>
            <div className='alignScene'>
              <div className='divEquips'>
                {equipamentos.map((select, index) => (
                  <CreatableSelect
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
              </div>
              <div className='divConexoes'>
                {conexoes.map((select, index) => (
                  <CreatableSelect
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
              </div>
            </div>
          </div>
        </div>
        <div className='divDir'>
          <div className='divFato'>
            <div id='valor1'>
              <CreatableSelect
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
            <AutosizeTextarea id="valor3" onChange={handleChange3} value={text} className='textarea' minRows={10} tabIndex="1" placeholder=' Ação: ' />
          </div>
        </div>
      </div>
      <div className='divButton' >
        <div>
          <Button color="success" onClick={refreshPage}>Limpar tela</Button>
        </div>
        <div>
          <Button color="success" onClick={handleCopy} >Copiar dados</Button>
        </div>
      </div>

    </div >
  );
}

export default App;