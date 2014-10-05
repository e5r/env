E5R Environment
===============

Collection of scripts for managing the development environment for E5R team.

## Instalação

Baixe e execute o script de instalação:

Plataforma | URL
-----------|-----------
Windows | https://raw.githubusercontent.com/e5r/env/master/scripts/e5r-install.bat
Unix | https://raw.githubusercontent.com/e5r/env/master/scripts/e5r-install.sh

## Arquitetura

A lógica em que se baseia a arquitetura do ambiente, tem como base o seguinte conceito:

Um único script é disponibilizado no seu sistema (`e5r`), junto a uma estrutura de diretórios bem definida. Esse script tem como objetivo executar comandos, que por sua vez são outros scripts em um diretório específico.

Porém se o script de comando não existir no diretório definido, o script `e5r` tenta fazer o download dele na internet. Dessa forma o script `e5r` é a única peça que precisa ser disponibilizada inicialmente em seu ambiente, e, de acordo com que os comandos são solicitados, esses são carregados da Internet (se existirem) na primeira execuçãp, e nas seguintes já estarão também disponíveis em seu ambiente para acesso direto.

A arquitetura básica então, provê um executor de comandos `on-demand`. Isso ainda nos dá a vantagem de termos em nosso sistema somente aquilo que precisamos, e não gastamos espaço com o que não usamos.

A arquitetura também prevê que toda a instalação é disponível apenas para o usuário, e nunca para todo o sistema. Alguns podem achar desvantagem a princípio, mas com o tempo se percebe as inúmeras vantagems, como:

* O usuário não requer permissões especiais no sistema para instalação
* Instalações/Desinstalações não afetam outros usuários
* Perfeito para ambientes de integração/entrega contínua

### Pré-requisitos

* Conexão sempre ativa com a Internet

### Features

* Instalação inicial mínima
* Instalação incremental `on-demand`
* Instalação baseada em usuários e não em 