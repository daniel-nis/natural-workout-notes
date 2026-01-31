import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { config } from './config'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: config.server.port },
  })
  console.log(`🚀 Server ready at: ${url}`)
}

startServer()