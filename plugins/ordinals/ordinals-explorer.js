import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
/**
 * Class to handle integration with the Ordinals Explorer
 */
export class OrdinalsExplorer {
    /**
     * Constructor for OrdinalsExplorer
     * @param explorerPath - Path to the Ordinals Explorer directory
     * @param port - Port to run the explorer on (default: 3000)
     */
    constructor(explorerPath, port = 3000) {
        this.isRunning = false;
        this.port = 3000;
        this.explorerPath = explorerPath;
        this.port = port;
    }
    /**
     * Start the Ordinals Explorer
     * @returns Promise with the URL of the running explorer
     */
    async startExplorer() {
        if (this.isRunning) {
            return `http://localhost:${this.port}`;
        }
        try {
            console.info(`Starting Ordinals Explorer at ${this.explorerPath}`);
            // Use Next.js dev server to run the explorer
            const command = `cd "${this.explorerPath}" && npm run dev -- -p ${this.port}`;
            // Run the command in the background
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error starting Ordinals Explorer: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Ordinals Explorer stderr: ${stderr}`);
                }
                console.info(`Ordinals Explorer stdout: ${stdout}`);
            });
            // Wait for the server to start
            await new Promise(resolve => setTimeout(resolve, 5000));
            this.isRunning = true;
            return `http://localhost:${this.port}`;
        }
        catch (error) {
            console.error(`Error starting Ordinals Explorer: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Stop the Ordinals Explorer
     */
    async stopExplorer() {
        if (!this.isRunning) {
            return;
        }
        try {
            // Find and kill the process running on the port
            if (process.platform === 'win32') {
                await execAsync(`FOR /F "tokens=5" %P IN ('netstat -ano | findstr :${this.port}') DO taskkill /F /PID %P`);
            }
            else {
                await execAsync(`lsof -i :${this.port} | grep LISTEN | awk '{print $2}' | xargs kill -9`);
            }
            this.isRunning = false;
            console.info('Ordinals Explorer stopped');
        }
        catch (error) {
            console.error(`Error stopping Ordinals Explorer: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get the status of the Ordinals Explorer
     * @returns Boolean indicating if the explorer is running
     */
    isExplorerRunning() {
        return this.isRunning;
    }
    /**
     * Get the URL of the running Ordinals Explorer
     * @returns URL of the running explorer or null if not running
     */
    getExplorerUrl() {
        return this.isRunning ? `http://localhost:${this.port}` : null;
    }
}
//# sourceMappingURL=ordinals-explorer.js.map