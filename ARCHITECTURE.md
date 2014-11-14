E5R Environment - Arquitetura
=============================

E5R Environment, é uma coleção de scripts para automação de tarefas que dizem respeito ao ambiente de desenvolvimento do ***Time de Desenvolvimento E5R***. Mas que pode facilmente ser usada por qualquer desenvolvedor (ou time de desenvolvimento) que pretenda aplicar os conceitos e padrões de desenvolvimento usados pelo ***E5R Development Team***, em seus projetos.

A ferramenta foi projetada para atender aos seguintes requisitos:

1. Ser de fácil instalação;
2. Não ocupar espaço desnecessário no disco;
3. Não requer compilação;
4. Não requer privilégios de administrador;
5. Não interferir no restante do sistema.

## Pensando a arquitetura

Para atender ao primeiro requisito **Ser de fácil instalação**, optamos por instalar somente o mínimo necessário, e criar um mecanismo que pudesse fazer as demais instalações silenciosamente sempre que necessário (`sob demanda`); e isso acabou nos levando ao segundo requisito, **Não ocupar espaço desnecessário no disco**.

Veja uma ilustração. Quando você instala uma ferramenta como **openssl** por exemplo, ela te dá os seguintes comandos padrões já disponíveis para usar:

```
asn1parse         ca                ciphers           cms
crl               crl2pkcs7         dgst              dh
dhparam           dsa               dsaparam          ec
ecparam           enc               engine            errstr
gendh             gendsa            genpkey           genrsa
nseq              ocsp              passwd            pkcs12
pkcs7             pkcs8             pkey              pkeypara
pkeyutl           prime             rand              req
rsa               rsautl            s_client          s_server
s_time            sess_id           smime             speed
spkac             srp               ts                verify
version           x509
```

Neste exemplo (acima), temos um total de 46 comandos, e cada um com sua lógica fazendo uma coisa diferente pra você, mas... **você dificilmente irá utilizar todos**, com muito trabalho usará uma dúzia deles talvez.

Claro que em se tratando dessa ferramenta (openssl), não dá pra falar de disperdício de espaço em disco, porque é uma ferramenta compilada (e essa não é uma opção pra nós, porque temos aqui o terceiro requisito **Não requer compilação**) e os comandos estão bem compactados em um (ou vários) pequenos executáveis. Mas de uma forma mais geral.

> "Não seria melhor instalar somente os comandos que eu vou realmente utilizar?"

Sim, mas... você saberia quais desses comandos vai precisar, pra somente instalar o pacote que lhe interessa? E se de repente você precisar de um comando que não achava antes que poderia precisar?

Este problema bem que poderia ser resolvido parcialmente fazendo com que o usuário pudesse selecionar que items deseja instalar no momento de baixar a ferramenta, igual como é feito em http://getbootstrap.com/customize.

Mas outra vez temos um problema, nós comprometemos nosso primeiro requisito (*Ser de fácil instalação*), isso porque o usuário precisaria de conhecimento prévio sobre os comandos em si. Sem contar no fato de que, depois, precisando de outro comando ele deveria realizar "outra instalação".

Depois de ponderá sobre todos esses pensamentos, chegamos a proposta abaixo.

## Arquitetura proposta

Decidimos que atendemos as três primeiros requisitos se fizermos a instalação de um único comando e disponibilizarmos para o usuário; o comando `e5r`.

Esse pode ser instalado facilmente (atendendo ao 1º requisito) como visto em [README.md](https://github.com/e5r/env/blob/0.1-alpha1/README.md).

Por ser somente script não requer compilação (atendendo o 2º requisito).

Além de não ocupar espaço desnecessário no disco (atendendo ao 3º requisito), não só porque se trata de um único script; não adiantaria nada se disponibilizássemos um único script, porém com todos os comandos contidos nele, o arquivo ocuparia espaço desnecessário do mesmo jeito se não usássemos todos.

Mas o comando `e5r` economiza espaço em disco porque na verdade ele não contém os `subcomandos` em seu conteúdo, ao invés disso, ele tem a única responsabilidade de identificar qual comando o usuário deseja executar, e com isso encontrá-lo no disco do usuário, fazendo inclusive a instalação do mesmo se for necessário (baixando da Internet e tudo mais).

Vamos ver como funciona o comando `e5r` nos bastidores.

## O comando `E5R`

Quando você faz a instalação da ferramenta, ela cria o diretório `.e5r` dentro do diretório do usuário que executou a instalação, contendo o script `.e5r`, e inclui esse caminho no `PATH` do usuário. Com isso o usuário já pode começar a trabalhar.

Vamos supor que o usuário deseja saber mais sobre a utilização da ferramenta. Então digita o comando:

```shell
e5r help
```

O `help` é um comando que exibe a ajuda da ferramenta, porém ainda não está disponível. Mas o comando `e5r` percebe que o mesmo não está no diretório de comandos do usuário, então procura e o encontra em um repositório da Internet, baixa e instala ele no local adequado; e então `o executa`.

Tudo isso é feito transparentemente, e o usuário então `vê` as informações de ajuda na tela. Em uma próxima vez que o usuário digitar `e5r help`, esse comando já existe em seu diretório de comandos, e é executado imediatamente.

Com isso dizemos que os comandos são instalados *sob demanda*, e o usuário nunca terá comandos que não tenha precisado usar pelo menos uma vez. Ou seja, nada de espaço sendo ocupado desnecessariamente.

## E os outros requisito?

Ainda não falamos do 4º e 5º requisito. Mas gostaria de tratar desses em um tópico só pra eles.

### 4º - Não requer privilégios de administrador

Você viu no tópico **O comando `E5R`** que a instalação é feita no diretório do usuário (`/Users/<usuario>/.e5r` no Windows, e `/home/<usuario>/.e5r` no Unix).

Isso porque é presumido que o usuário que executa a instalação tem as permissões necessárias pelo menos em **seu próprio diretório** de usuário; mas não é garantido que ele tenha as permissões necessárias se fizermos a instalação em `/Program Files` ou `/bin` por exemplo, porque esses diretórios normalmente necessitam de permissões especiais.

Fazendo a instalação no próprio diretório do usuário nós atendemos ao 4º requisito, mas não só isso; de quebra atendemos também ao 5º requisito.

### 5º - Não interferir no restante do sistema

Quando fazemos uma instalação nos diretórios do sistema, todos os usuários desse sistema se "beneficiam" de tal instalação porque podem usar os programas instalados. Mas no mundo do desenvolvimento, é comum a experimentação; por isso nós estamos a todo instante instalando e desinstalando softwares, e testando novas versões. E você já sabe o que acontece quando nós temos por exemplo o Microsoft Office 2010 instalado na máquina, e instalamos a versão 2013 pra "NÓS"; acontece que nós afetamos aos demais usuários.

Não interferir no restante do sistema quer dizer que nós podemos instalar, desinstalar, e atualizar nossas ferramentas; e essas, só afetarem o nosso ambiente.

Com a instalação no próprio diretório do usuário atendemos ao 5º requisito.

## Indo além

Talvez você possa se questionar:

* Porque usarmos `scripts` para instalação de ferramentas e não usamos uma interface gráfica que é bem mais prático?

Os scripts (ou programas de linha de comando) são na verdade a base para os programas de GUI (*Graphical User Interface*). Quando você usa uma ferramenta gráfica poderosa como o Visual Studio, Eclipse ou Netbeans, e clica em `compilar` por exemplo; o que ele faz na verdade é chamar um programa de linha de comando pra fazer o trabalho pesado. Por isso ter ferramentas assim bem estruturadas é o melhor caminho, depois, criar plugins ou interfaces gráficas (seja Desktop ou Web) é mais fácil; *mas fica pra depois*.

* Ou, porque fazer instalação no diretório do usuário e não nos diretórios do sistema já destinados para esse fim?

> E quando vários usuário da mesma máquina decidem usar a ferramenta. Vai existir duplicidade?

Sim, mas esse é o menor dos problemas; não chega nem a ser um problema se comparado com a vantagem de não necessitar de privilégios especiais pra instalação e o fato de não interferir no restante do sistema.

Além do mais, essa ferramenta não ajuda somente no momento do desenvolvimento, mas também no momento da implantação.

> Certo dia eu ([Erlimar](https://github.com/erlimar)) estava fazendo uns testes nas ferramentas https://travis-ci.org e https://heroku.com. Até aí nada de mais, se não fosse o fato de que meus testes estarem sendo feitos na nova plataforma [ASP.NET vNext](http://asp.net/vnext), e tanto o Travis CI quanto o Heroku não davam suporte nativos a essa plataforma (até porque a plataforma ainda não tinha sido lançada - na verdade, até o momento em que escrevo este texto a plataforma ainda não foi lançada)





* O usuário não requer permissões especiais no sistema para instalação
* Instalações/Desinstalações não afetam outros usuários
* Perfeito para ambientes de integração/entrega contínua

### Pré-requisitos

* Conexão sempre ativa com a Internet
