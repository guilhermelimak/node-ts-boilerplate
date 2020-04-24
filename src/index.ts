import express from 'express'
import bodyParser from 'body-parser'
import crypto from 'crypto'
import { readdirSync } from 'fs'
import { execSync } from 'child_process'
import repositories from '../repositories.json'

const app = express()

const main = () => {
  app.use(bodyParser.raw({ type: '*/*' }))

  app.get('/', (_, res) => res.send('Armandin pilantra'))

  app.post('/', (req, res) => {
    try {
      const sigHeader = req.headers['x-gogs-signature']

      if (!sigHeader || !req.body) {
        res.send('Armandin pilantra')
        return
      }

      const sig = crypto
        .createHmac('sha256', 'armandin-da-o-boga')
        .update(req.body)
        .digest('hex')

      if (sig !== sigHeader) {
        res.send('Armandin pilantra')
        return
      }

      const body = JSON.parse(req.body.toString())

      const files = readdirSync(repositories.basePath)

      if (files.indexOf(body.repository.name) < 0) {
        res.send('Armandin pilantra')
        return
      }

      const repo = repositories[body.repository.name]

      if (!repo || !repo.commands.length) {
        res.send('Armandin pilantra')
        return
      }

      process.chdir(repositories.basePath + body.repository.name)

      repo.commands.map(execSync)
    } catch (err) {
      console.error(err)
      res.send('Armandin pilantra')
      return
    }

    res.send('ok')
  })
}

main()

app.listen(8888)
