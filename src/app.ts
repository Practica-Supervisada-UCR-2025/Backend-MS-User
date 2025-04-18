import express, { Request, Response, NextFunction } from 'express';
import registerRoutes from './features/users/routes/register.routes';
import systemRoutes from './features/system/routes/system.routes';
import { errorHandler } from './utils/errors/error-handler.middleware';
import authRoutes from './features/users/routes/login.routes';
import forgotPasswordRoutes from './features/users/routes/forgot.password.routes';
const app = express();
const PORT = 3000;


app.get('/', (req, res) => {
    res.send('Server is running on port 3000');
});

app.use(express.json());
app.use('/api', registerRoutes);
app.use('/api', authRoutes);
app.use('/api/system', systemRoutes);
app.use('/api', forgotPasswordRoutes);

// Error handling middleware should be last
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});