import mysql from "mysql2/promise"

const connection = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
})

export const getConnection = () => connection

export const getTransactionConnection = async () => {
  return await connection.getConnection();
}
