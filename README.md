E5R Environment
===============

Collection of scripts for managing the development environment for E5R team.

## Scripts

* e5r-bootstrapper
* e5r-build

## Supports

* .NET vNext

## TODO

#### Incluir __HASH__ para atualização via GitHub

Quando um `.e5r\lang\x\bootstrapper.ps1` é atualizado no repositório GitHub
porém já está instalado localmente, este nunca é atualizado

#### Permitir parâmetros adicionais do tipo string

Hoje quando chamamos o bootstrapper com uma expressão do tipo:

    bootstrapper.bat -lang dotnet outro parametro "mais um parâmetro"

o mesmo vai interpretar os parâmetros como:

    arg[0] => outro
    arg[1] => parametro
    arg[2] => mais
    arg[3] => um
    arg[4] => parâmetro

Enquanto que o correto seria:

    arg[0] => outro
    arg[1] => parametro
    arg[2] => mais um parâmetro

#### Construir __DotNet vNext Bootstrapper__
#### Construir __NodeJS Bootstrapper__
#### Construir __PHP Bootstrapper__
#### Construir __Ruby Bootstrapper__
