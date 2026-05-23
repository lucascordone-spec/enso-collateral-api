import express from 'express';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { setupRoutes } from './routes';
import { swaggerDocument } from './swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Set up Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Setup API routes
setupRoutes(app);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
