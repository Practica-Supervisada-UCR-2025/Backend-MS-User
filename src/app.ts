// Do NOT remove or move this appdynamics require, it must be on the first line, or else it will not work
require("appdynamics").profile({
 controllerHostName: process.env.APP_DYNAMICS_HOST,
 controllerPort: 443,
 // If SSL, be sure to enable the next line
 controllerSslEnabled: true,
 accountName: process.env.APP_DYNAMICS_ACCOUNT_NAME,
 accountAccessKey: process.env.APP_DYNAMICS_KEY,
 applicationName: 'Backend-user-app',
 tierName: 'Backend-user-tier',
 nodeName: 'process' // The controller will automatically append the node name with a unique number
});
import express, { Request, Response, NextFunction } from 'express';
import registerRoutes from './features/users/routes/register.routes';
import systemRoutes from './features/system/routes/system.routes';
import { errorHandler } from './utils/errors/error-handler.middleware';
import authRoutes from './features/users/routes/login.routes';
import forgotPasswordRoutes from './features/users/routes/forgot.password.routes';
import profileRoutes from './features/users/routes/profile.routes';
import exportUsersPdfRoutes from './features/users/routes/exportUserPdf.routes'; 
import getAllUsersRoutes from './features/users/routes/getAllUsers.routes';
import cors from "cors";


export const app = express();
const PORT = 3000;


app.get('/', (req, res) => {
    res.send('Server is running on port 3000');
});

app.use(express.json());
app.use(cors());
app.use('/api', registerRoutes);
app.use('/api', authRoutes);
app.use('/api/system', systemRoutes);
app.use('/api', forgotPasswordRoutes);
app.use('/api', profileRoutes);
app.use('/api', exportUsersPdfRoutes);
app.use('/api', getAllUsersRoutes);
// Error handling middleware should be last
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
