import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { runDiagnostics } from '@/lib/hospital-diagnostics';

export default function DiagnosticsPage() {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string>('');

  const handleRunDiagnostics = async () => {
    setRunning(true);
    setOutput('Running diagnostics...\n');
    
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    let allOutput = 'Running diagnostics...\n\n';
    
    const captureLog = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      allOutput += message + '\n';
      setOutput(allOutput);
      originalLog(...args);
    };
    
    console.log = captureLog;
    console.error = captureLog;
    console.warn = captureLog;
    
    try {
      await runDiagnostics();
    } catch (err) {
      allOutput += `\n❌ EXCEPTION: ${err}\n`;
      console.error(err);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Hospital Registration Diagnostics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900">What this does:</p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>✓ Tests if data can be INSERTED to hospital_applications table</li>
                  <li>✓ Tests if data can be READ from hospital_applications table</li>
                  <li>✓ Identifies RLS policy issues</li>
                  <li>✓ Shows exact error messages from Supabase</li>
                </ul>
              </div>

              <Button 
                onClick={handleRunDiagnostics} 
                disabled={running}
                size="lg"
                className="w-full"
              >
                {running ? 'Running Tests...' : 'Run Diagnostics'}
              </Button>

              {output && (
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-96">
                  <pre>{output}</pre>
                </div>
              )}

              {output && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-2">💡 Next Steps:</p>
                  <ol className="text-sm text-amber-800 space-y-2 list-decimal list-inside">
                    <li>Check the output above for error messages</li>
                    <li>If you see "RLS POLICY ERROR", run the SQL from fix-hospital-rls.js</li>
                    <li>After running SQL, try this diagnostic again</li>
                    <li>Then test the hospital registration form</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
