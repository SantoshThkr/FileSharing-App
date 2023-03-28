import 'dotenv/config';
import app from './app';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

const port = Number(process.env.PORT) || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
