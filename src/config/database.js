import { Sequelize } from 'sequelize'
import env from './env.js'
import pg from 'pg'

const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: 'postgres',
      dialectModule: pg,
    logging: (...msg) => console.log('[sequelize]', ...msg),
    dialectOptions: env.db.ssl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  }
)

// Attempt to authenticate immediately to expose any runtime errors early
sequelize
  .authenticate()
  .then(() => console.log('Sequelize: authentication successful'))
  .catch((err) => {
    console.error('Sequelize authentication error:', err && err.stack ? err.stack : err)
  })

export default sequelize
