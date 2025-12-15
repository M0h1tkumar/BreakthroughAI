import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, FileText, Pill, Filter } from 'lucide-react';
import { secureDB } from '@/lib/secureDatabase';
import { ToastService } from '@/components/ui/toast-notification';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [medicineResults, setMedicineResults] = useState<any[]>([]);
  const [reportResults, setReportResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleGlobalSearch = async () => {
    if (!searchTerm.trim()) {
      ToastService.show('Please enter a search term', 'error');
      return;
    }

    setIsSearching(true);
    
    try {
      // Search patients
      const patients = secureDB.searchPatients(searchTerm);
      setPatientResults(patients);

      // Search medicines
      const medicines = secureDB.searchMedicines(searchTerm);
      setMedicineResults(medicines.slice(0, 20)); // Limit results

      // Search reports
      const reports = secureDB.getReports().filter(r => 
        r.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setReportResults(reports);

      const totalResults = patients.length + medicines.length + reports.length;
      ToastService.show(`Found ${totalResults} results for "${searchTerm}"`, 'success');
      
    } catch (error) {
      ToastService.show('Search failed. Please try again.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const viewPatient = (patientId: string) => {
    const patient = secureDB.getPatients().find(p => p.id === patientId);
    if (patient) {
      alert(`Patient: ${patient.name}\nSymptoms: ${patient.symptoms.join(', ')}\nStatus: ${patient.status}`);
    }
  };

  const viewReport = (reportId: string) => {
    const report = secureDB.getReports().find(r => r.id === reportId);
    if (report) {
      alert(`Report ID: ${report.id}\nContent: ${report.content.substring(0, 200)}...`);
    }
  };

  const quickSearches = [
    { term: 'chest pain', category: 'Symptoms' },
    { term: 'paracetamol', category: 'Medicine' },
    { term: 'fever', category: 'Symptoms' },
    { term: 'antibiotics', category: 'Medicine' },
    { term: 'pending', category: 'Status' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Global Search</h1>
            <p className="text-muted-foreground">Search across patients, medicines, and reports</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            Advanced Search
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Everything</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search patients, medicines, reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleGlobalSearch()}
              />
              <Button onClick={handleGlobalSearch} disabled={isSearching}>
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Quick searches:</span>
              {quickSearches.map((quick, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm(quick.term);
                    setTimeout(handleGlobalSearch, 100);
                  }}
                >
                  {quick.term}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {(patientResults.length > 0 || medicineResults.length > 0 || reportResults.length > 0) && (
          <Tabs defaultValue="patients" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Patients ({patientResults.length})
              </TabsTrigger>
              <TabsTrigger value="medicines" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Medicines ({medicineResults.length})
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports ({reportResults.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patients" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patientResults.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-gray-600">
                            {patient.symptoms.join(', ')} | Age: {patient.age}
                          </p>
                          <Badge variant="outline">{patient.status}</Badge>
                        </div>
                        <Button size="sm" onClick={() => viewPatient(patient.id)}>
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medicines" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Medicine Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {medicineResults.map((medicine) => (
                      <div key={medicine.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{medicine.name}</p>
                          <p className="text-sm text-gray-600">
                            {medicine.category} | {medicine.manufacturer}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">₹{medicine.price}</Badge>
                            <Badge variant={medicine.stock < 100 ? 'destructive' : 'outline'}>
                              Stock: {medicine.stock}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Report Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportResults.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Report {report.id}</p>
                          <p className="text-sm text-gray-600">
                            {report.content.substring(0, 100)}...
                          </p>
                          <Badge variant="outline">{report.status}</Badge>
                        </div>
                        <Button size="sm" onClick={() => viewReport(report.id)}>
                          View Report
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {searchTerm && patientResults.length === 0 && medicineResults.length === 0 && reportResults.length === 0 && !isSearching && (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500">No results found for "{searchTerm}"</p>
              <p className="text-sm text-gray-400 mt-2">Try different keywords or check spelling</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}