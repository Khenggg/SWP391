const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.iqzkddymzmfhyqbfrnyu:Moghicha12%40@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT username, password_hash FROM users WHERE username='admin01'");
  console.log(res.rows);
  await client.end();
}
run().catch(console.dir);
