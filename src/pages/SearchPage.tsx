import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, FileText, Pill, Filter } from 'lucide-react';
import { secureDB } from '@/lib/secureDatabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToastService } from '@/components/ui/toast-notification';
import { useNavigate } from 'react-router-dom';

// Lightweight local types
type Patient = {
  id: string;
  name: string;
  age?: number;
  phone?: string;
  symptoms?: string[];
  status?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  dataToken?: string;
  image?: string;
  imageData?: string;
  healthReport?: unknown;
  lastUpdated?: string;
};

type Medicine = { id: string; name: string; category?: string; manufacturer?: string; price?: number; stock?: number };
type Report = { id: string; content: string; status?: string };

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [medicineResults, setMedicineResults] = useState<Medicine[]>([]);
  const [reportResults, setReportResults] = useState<Report[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleGlobalSearch = async () => {
    if (!searchTerm.trim()) {
      ToastService.show('Please enter a search term', 'error');
      return;
    }

    setIsSearching(true);
    
    try {
      // Search patients and enrich with priority from healthReports (keep in sync with DoctorDashboard)
      const patients = secureDB.searchPatients(searchTerm) as Patient[];
      try {
        const healthReports = JSON.parse(localStorage.getItem('healthReports') || '[]') as Array<Record<string, unknown>>;
        const enriched = patients.map(p => {
          const copy: Patient = { ...p };
          const match = healthReports.find(rec => {
            const pid = rec['patientId'];
            const pname = rec['patientName'];
            return (typeof pid === 'string' && pid === copy.id) || (typeof pname === 'string' && pname === copy.name);
          });
          if (match) {
            copy.priority = 'HIGH';
            const t = match['patientToken']; if (typeof t === 'string') copy.dataToken = copy.dataToken || t;
            const img = match['image']; if (typeof img === 'string') copy.image = copy.image || img;
            const imgData = match['imageData']; if (typeof imgData === 'string') copy.imageData = copy.imageData || imgData;
            copy.healthReport = match;
          } else {
            // demo fallbacks
            if (copy.id === '1') copy.priority = 'HIGH';
            else if (copy.id === '2') copy.priority = 'MEDIUM';
          }
          return copy;
        });
        setPatientResults(enriched);
      } catch (e) {
        setPatientResults(patients);
      }

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

  const navigate = useNavigate();

  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<Patient | null>(null);

  const viewPatient = (patientId: string) => {
    // Open in-page dialog with patient details. Try to find patient from search results or secureDB
    const foundRaw = patientResults.find(p => p.id === patientId) || secureDB.getPatientById(patientId);
    if (foundRaw) {
      // clone and enrich with priority data from local sources to keep UI in-sync with dashboard
      const found: Patient = { ...(foundRaw as Patient) };
      try {
        const healthReports = JSON.parse(localStorage.getItem('healthReports') || '[]') as Array<Record<string, unknown>>;
        const match = healthReports.find(rec => {
          const pid = rec['patientId'];
          const pname = rec['patientName'];
          return (typeof pid === 'string' && pid === found.id) || (typeof pname === 'string' && pname === found.name);
        });
        if (match) {
          found.priority = 'HIGH';
          found.healthReport = match;
          const patientToken = match['patientToken'];
          if (typeof patientToken === 'string' && !found.dataToken) found.dataToken = patientToken;
          const img = match['image'];
          if (typeof img === 'string') found.image = img;
          const imgData = match['imageData'];
          if (typeof imgData === 'string') found.imageData = imgData;
        }
      } catch (e) {
        // ignore parse errors
      }

      // Fallback for the demo mock patients used in dashboard
      if (!found.priority) {
        if (found.id === '1') found.priority = 'HIGH';
        else if (found.id === '2') found.priority = 'MEDIUM';
        else found.priority = found.priority || 'LOW';
      }

      setSelectedPatientForDetails(found);
      setShowPatientDetails(true);
    } else {
      ToastService.show('Patient details not found', 'error');
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

                  <Dialog open={showPatientDetails} onOpenChange={setShowPatientDetails}>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Patient Details - {selectedPatientForDetails?.name}</DialogTitle>
                      </DialogHeader>
                      {selectedPatientForDetails && (
                        <div className="space-y-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-medium text-blue-800 mb-3">Patient Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><strong>Name:</strong> {selectedPatientForDetails.name}</p>
                              <p><strong>Age:</strong> {selectedPatientForDetails.age || 'Unknown'}</p>
                              <p><strong>Phone:</strong> {selectedPatientForDetails.phone}</p>
                            </div>
                            <div>
                              <p className="flex items-center gap-2"><strong>Priority:</strong>
                                {(() => {
                                  const p = selectedPatientForDetails.priority || 'N/A';
                                  const cls = p === 'HIGH'
                                    ? 'bg-red-600 text-white px-3 py-0.5 rounded-full text-sm font-semibold'
                                    : p === 'MEDIUM'
                                      ? 'bg-yellow-400 text-black px-3 py-0.5 rounded-full text-sm font-semibold'
                                      : 'bg-gray-200 text-gray-800 px-3 py-0.5 rounded-full text-sm font-semibold';
                                  return <span className={cls}>{p}</span>;
                                })()}
                              </p>
                              <p><strong>Token:</strong> {selectedPatientForDetails.dataToken || 'N/A'}</p>
                            </div>
                          </div>
                          </div>

                          <div className="bg-gray-50 border rounded-lg p-4">
                            <h4 className="font-medium mb-3">Symptoms & Medical History</h4>
                            <p className="text-sm text-gray-700 mb-2">
                              <strong>Current Symptoms:</strong> {selectedPatientForDetails.symptoms?.join(', ')}
                            </p>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button onClick={() => setShowPatientDetails(false)}>
                              Close
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

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