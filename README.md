E5R Environment
===============

> Uma coleção de scripts para automação de tarefas de ambiente, para E5R Development Team.

* [Saiba mais sobre a arquitetura](doc/ARCHITECTURE.md)
* [Guia do Usuário](doc/USERGUIDE.md)
* [Notas de Lançamento](https://github.com/e5r/env/releases/tag/v0.1.0-alpha1) da versão **0.1.0-alpha1**

## Instalação

### Windows 7/8 ou superior

Execute um dos códigos abaixo em seu shell favorito.

#### Prompt de Comando

```cmd
bitsadmin /TRANSFER "Installing E5R Env..." "https://github.com/e5r/env/raw/migrate-to-javascript/e5r-install.cmd" "%CD%\e5r-install.cmd" && "%CD%\e5r-install.cmd" && del "%CD%\e5r-install.cmd"
```
#### Prompt de Comando

```powershell
cmd /c 'bitsadmin /TRANSFER "Installing E5R Env..." "https://github.com/e5r/env/raw/migrate-to-javascript/e5r-install.cmd" "%CD%\e5r-install.cmd" && "%CD%\e5r-install.cmd" && del "%CD%\e5r-install.cmd"'
```

### ~~Unix like~~

(em breve)

## Problemas?

Caso encontre algum problema durante a instalação, ou até mesmo durante a utilização da ferramenta, [abra um incidente](https://github.com/e5r/env/issues).

## Métricas

[![Throughput Graph](https://graphs.waffle.io/e5r/env/throughput.svg)](https://waffle.io/e5r/env/metrics)

[![Stories in Ready](https://badge.waffle.io/e5r/env.svg?label=ready&title=Ready)](http://waffle.io/e5r/env) [![Stories in Ready](https://badge.waffle.io/e5r/env.svg?label=In%20Progress&title=In%20Progress)](http://waffle.io/e5r/env)
