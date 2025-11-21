import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const sb = supabase as any;

export default function TestHospitalInsert() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testInsert = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Starting test insert...');

      const testData = {
        representative_first_name: 'Test',
        representative_last_name: 'Hospital',
        representative_role: 'Director',
        representative_phone: '9876543210',
        representative_email: 'test@hospital.com',
        hospital_name: `Test Hospital ${new Date().getTime()}`,
        type: 'private',
        official_phone: '9876543210',
        emergency_number: '9876543210',
        address: '123 Hospital Street',
        city: 'Test City',
        state: 'Test State',
        zip_code: '12345',
        status: 'pending',
      };

      console.log('📋 Payload:', testData);

      const { data, error: insertError } = await sb
        .from('hospital_applications')
        .insert([testData])
        .select();

      console.log('📤 Response:', { data, error: insertError });

      if (insertError) {
        throw insertError;
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from insert');
      }

      setResult({
        success: true,
        message: 'Hospital inserted successfully!',
        recordId: data[0].id,
        hospitalName: data[0].hospital_name,
      });

      console.log('✅ SUCCESS! Record ID:', data[0].id);
    } catch (err: any) {
      console.error('❌ ERROR:', err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const checkExisting = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔍 Checking existing records...');

      const { data, error: fetchError } = await sb
        .from('hospital_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      console.log('📤 Response:', { data, error: fetchError });

      if (fetchError) {
        throw fetchError;
      }

      setResult({
        success: true,
        message: `Found ${data?.length || 0} records`,
        records: data,
      });

      console.log('✅ Found records:', data);
    } catch (err: any) {
      console.error('❌ ERROR:', err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>🧪 Test Hospital Insert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This page tests if hospital_applications table can accept insertions.
              </p>

              <div className="space-y-2">
                <Button onClick={testInsert} disabled={loading} className="w-full">
                  {loading ? 'Testing...' : '🧪 Insert Test Hospital'}
                </Button>

                <Button onClick={checkExisting} disabled={loading} variant="outline" className="w-full">
                  {loading ? 'Checking...' : '🔍 Check Existing Records'}
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <p className="text-sm font-semibold text-red-900">❌ Error:</p>
                  <p className="text-sm text-red-800 mt-1">{error}</p>
                </div>
              )}

              {result && (
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <p className="text-sm font-semibold text-green-900">✅ {result.message}</p>
                  {result.recordId && (
                    <p className="text-sm text-green-800 mt-1">
                      Record ID: <code className="bg-green-100 px-2 py-1 rounded">{result.recordId}</code>
                    </p>
                  )}
                  {result.hospitalName && (
                    <p className="text-sm text-green-800">
                      Hospital: <span className="font-semibold">{result.hospitalName}</span>
                    </p>
                  )}
                  {result.records && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-green-900">Records:</p>
                      <pre className="bg-green-100 p-2 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(result.records, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
                <p className="font-semibold text-blue-900">📝 Instructions:</p>
                <ol className="list-decimal list-inside text-blue-800 mt-2 space-y-1">
                  <li>Click "Insert Test Hospital" to test database write</li>
                  <li>Check browser console (F12) for detailed logs</li>
                  <li>If successful, go to admin dashboard to verify</li>
                  <li>If failed, check the error message for RLS/permission issues</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
