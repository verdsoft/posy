declare namespace NodeJS {
  interface ProcessEnv {
    MYSQL_HOST: string
    MYSQL_PORT: string
    MYSQL_USER: string
    MYSQL_PASSWORD: string
    MYSQL_DATABASE: string
  }
}
