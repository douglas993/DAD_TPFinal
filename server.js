const express = require('express')
const expressGraphQL = require('express-graphql')
const app = express()
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')


//Dados que serão utilizados
const autores = [
    { id: 1, nome: 'J.K. Rowling' },
    { id: 2, nome: 'Augusto Cury' },
    { id: 3, nome: 'Brené Brown' },
]

const livros = [
    { id: 1, nome: 'Harry Potter e a Pedra Filosofal', autorID: 1 },
    { id: 2, nome: 'Harry Potter e o Prisioneiro de Azkaban', autorID: 1 },
    { id: 3, nome: 'Prisioneiros da Mente', autorID: 2 },
    { id: 4, nome: 'Mentes Aceleradas', autorID: 2 },
    { id: 5, nome: 'A Coragem de ser Imperfeito', autorID: 3 }
]


//Declarando as Querys para a consulta do GraphQL
const BookType = new GraphQLObjectType({
    name: 'Livros',
    description: 'Apresenta os livros escritos por autor',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        nome: { type: GraphQLNonNull(GraphQLString) },
        autorID: { type: GraphQLNonNull(GraphQLInt) },
        autor: {
            type: AuthorType,
            resolve: (livros) => {
                return autores.find(autor => autor.id === livros.autorID)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Autores',
    description: 'Apresenta os Autores',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        nome: { type: GraphQLNonNull(GraphQLString) },
        livro: {
            type: new GraphQLList(BookType),
            resolve: (autores) => {
                return livros.filter(livro => livro.autorID === autores.id)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        livro: {
            type: BookType,
            description: 'Busca por um único Livro',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => livros.find(livro => livro.id === args.id)
        },
        livros: {
            type: new GraphQLList(BookType),
            description: 'Lista de Livros',
            resolve: () => livros
        },
        autores: {
            type: new GraphQLList(AuthorType),
            description: 'Lista de Autores',
            resolve: () => autores
        }
    })
})


//Mutation é como se fosse o CRUD
const RootMutationType = new GraphQLObjectType({
    name: 'MutationTest',
    description: 'Teste utilizando o metodo Mutation',
    fields: () => ({
        addLivro: {
            type: BookType,
            description: 'Adicionando Livro',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                autorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const livro = { id: livros.length + 1, nome: args.name, autorID: args.autorId }
                livros.push(livro)
                return livro
            }
        },
        addAutor: {
            type: AuthorType,
            description: 'Adicionando Autor',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const autor = { id: autores.length + 1, nome: args.name }
                autores.push(autor)
                return autor
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))
app.listen(5000, () => console.log("Server Running"))