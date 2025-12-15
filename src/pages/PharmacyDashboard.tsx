import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pill, Package, CheckCircle, Search, TrendingUp, BarChart3, MapPin, Navigation } from 'lucide-react';

export default function PharmacyDashboard() {
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 'presc_1',
      patientName: 'Pree Om',
      doctorName: 'Dr. Rajesh Khanna',
      medicines: ['Paracetamol 500mg', 'Azithromycin 250mg'],
      status: 'PENDING',
      createdAt: '2024-01-15T12:00:00Z',
      prescribedBy: 'Dr. Rajesh Khanna (Cardiology)',
      notes: 'Prescribed by doctor for chest pain and fever'
    },
    {
      id: 'presc_2', 
      patientName: 'Priya Sharma',
      doctorName: 'Dr. Priya Malhotra',
      medicines: ['Ibuprofen 400mg'],
      status: 'READY',
      createdAt: '2024-01-16T14:00:00Z',
      prescribedBy: 'Dr. Priya Malhotra (General Medicine)',
      notes: 'Doctor prescribed for headache and body pain'
    },
    {
      id: 'presc_3',
      patientName: 'Amit Patel',
      doctorName: 'Dr. Amit Sharma',
      medicines: ['Omeprazole 20mg', 'Metformin 500mg'],
      status: 'DISPENSED',
      createdAt: '2024-01-17T10:00:00Z',
      prescribedBy: 'Dr. Amit Sharma (Neurology)',
      notes: 'Doctor prescribed for gastritis and diabetes management'
    }
  ]);

  const [medicines] = useState([
    // Pain Relief & Fever
    { id: 1, name: 'Paracetamol 500mg', category: 'Analgesics', price: 25, stock: 500, demand: 95 },
    { id: 2, name: 'Ibuprofen 400mg', category: 'Anti-inflammatory', price: 45, stock: 300, demand: 88 },
    { id: 3, name: 'Aspirin 75mg', category: 'Analgesics', price: 15, stock: 400, demand: 72 },
    { id: 4, name: 'Diclofenac 50mg', category: 'Anti-inflammatory', price: 35, stock: 250, demand: 65 },
    
    // Antibiotics
    { id: 5, name: 'Azithromycin 250mg', category: 'Antibiotics', price: 120, stock: 150, demand: 82 },
    { id: 6, name: 'Amoxicillin 500mg', category: 'Antibiotics', price: 80, stock: 200, demand: 78 },
    { id: 7, name: 'Ciprofloxacin 500mg', category: 'Antibiotics', price: 95, stock: 180, demand: 68 },
    { id: 8, name: 'Doxycycline 100mg', category: 'Antibiotics', price: 110, stock: 120, demand: 55 },
    
    // Gastrointestinal
    { id: 9, name: 'Omeprazole 20mg', category: 'Antacids', price: 60, stock: 350, demand: 90 },
    { id: 10, name: 'Ranitidine 150mg', category: 'Antacids', price: 40, stock: 280, demand: 75 },
    { id: 11, name: 'Domperidone 10mg', category: 'Gastrointestinal', price: 50, stock: 200, demand: 62 },
    { id: 12, name: 'Loperamide 2mg', category: 'Gastrointestinal', price: 30, stock: 150, demand: 45 },
    
    // Diabetes
    { id: 13, name: 'Metformin 500mg', category: 'Antidiabetics', price: 85, stock: 400, demand: 92 },
    { id: 14, name: 'Glimepiride 2mg', category: 'Antidiabetics', price: 120, stock: 180, demand: 70 },
    { id: 15, name: 'Insulin Glargine', category: 'Antidiabetics', price: 850, stock: 50, demand: 85 },
    
    // Cardiovascular
    { id: 16, name: 'Amlodipine 5mg', category: 'Cardiovascular', price: 75, stock: 300, demand: 88 },
    { id: 17, name: 'Atenolol 50mg', category: 'Cardiovascular', price: 65, stock: 250, demand: 76 },
    { id: 18, name: 'Lisinopril 10mg', category: 'Cardiovascular', price: 90, stock: 200, demand: 72 },
    { id: 19, name: 'Simvastatin 20mg', category: 'Cardiovascular', price: 110, stock: 180, demand: 68 },
    
    // Respiratory
    { id: 20, name: 'Salbutamol Inhaler', category: 'Respiratory', price: 180, stock: 100, demand: 80 },
    { id: 21, name: 'Cetirizine 10mg', category: 'Antihistamines', price: 35, stock: 400, demand: 85 },
    { id: 22, name: 'Loratadine 10mg', category: 'Antihistamines', price: 45, stock: 300, demand: 70 },
    { id: 23, name: 'Montelukast 10mg', category: 'Respiratory', price: 150, stock: 120, demand: 65 },
    
    // Vitamins & Supplements
    { id: 24, name: 'Vitamin D3 60000 IU', category: 'Vitamins', price: 25, stock: 500, demand: 95 },
    { id: 25, name: 'Vitamin B12 1500mcg', category: 'Vitamins', price: 40, stock: 350, demand: 82 },
    { id: 26, name: 'Calcium Carbonate 500mg', category: 'Supplements', price: 30, stock: 400, demand: 78 },
    { id: 27, name: 'Iron Folic Acid', category: 'Supplements', price: 20, stock: 300, demand: 88 },
    
    // Neurological
    { id: 28, name: 'Gabapentin 300mg', category: 'Neurological', price: 120, stock: 150, demand: 60 },
    { id: 29, name: 'Pregabalin 75mg', category: 'Neurological', price: 180, stock: 100, demand: 55 },
    { id: 30, name: 'Phenytoin 100mg', category: 'Neurological', price: 85, stock: 120, demand: 45 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [...new Set(medicines.map(m => m.category))];
  
  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const topDemandMedicines = medicines
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 5);

  const categoryDemand = categories.map(category => {
    const categoryMeds = medicines.filter(m => m.category === category);
    const avgDemand = categoryMeds.reduce((sum, m) => sum + m.demand, 0) / categoryMeds.length;
    return { category, demand: Math.round(avgDemand), count: categoryMeds.length };
  }).sort((a, b) => b.demand - a.demand);

  const updatePrescriptionStatus = (id: string, newStatus: string) => {
    setPrescriptions(prev => prev.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    ));
    alert(`Prescription ${id} updated to ${newStatus}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pharmacy Dashboard</h1>
            <p className="text-muted-foreground">Medicine management and prescription fulfillment</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Pill className="h-4 w-4" />
            Apollo Pharmacy Active
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Doctor Prescriptions ({prescriptions.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">Medicines prescribed by doctors for patients</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{prescription.patientName}</p>
                        <p className="text-sm text-blue-600 font-medium">Prescribed by: {prescription.prescribedBy || prescription.doctorName}</p>
                        <p className="text-xs text-gray-500">
                          Medicines: {prescription.medicines.join(', ')}
                        </p>
                        <p className="text-xs text-green-600 italic">
                          {prescription.notes || 'Doctor prescribed medication'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          prescription.status === 'DISPENSED' ? 'default' :
                          prescription.status === 'READY' ? 'secondary' : 'outline'
                        }>
                          {prescription.status}
                        </Badge>
                        {prescription.status === 'PENDING' && (
                          <Button size="sm" onClick={() => updatePrescriptionStatus(prescription.id, 'READY')}>
                            Prepare
                          </Button>
                        )}
                        {prescription.status === 'READY' && (
                          <Button size="sm" onClick={() => {
                            updatePrescriptionStatus(prescription.id, 'DISPENSED');
                            // Generate and send e-bill to WhatsApp
                            const eBill = {
                              id: `BILL_${Date.now()}`,
                              patientName: prescription.patientName,
                              medicines: prescription.medicines,
                              total: prescription.medicines.length * 150,
                              date: new Date().toLocaleDateString()
                            };
                            
                            const message = `🏥 *SWASTH AI E-BILL*\n\n` +
                              `📋 Bill ID: ${eBill.id}\n` +
                              `🎫 Token: ${prescription.id.toUpperCase()}\n` +
                              `👤 Patient: ${eBill.patientName}\n` +
                              `👨‍⚕️ Prescribed by: ${prescription.prescribedBy || prescription.doctorName}\n` +
                              `💊 Medicines: ${eBill.medicines.join(', ')}\n` +
                              `💰 Total: ₹${eBill.total} (incl. GST)\n` +
                              `📅 Date: ${eBill.date}\n\n` +
                              `✅ Medicine Ready for Pickup!\n` +
                              `📝 You can take away your medicines once dispatched under token number: ${prescription.id.toUpperCase()}\n` +
                              `🩺 Doctor's prescription fulfilled by Apollo Pharmacy\n\n` +
                              `📍 Apollo Pharmacy\n` +
                              `123 Main Street, Delhi\n` +
                              `📞 9876543300\n\n` +
                              `🙏 Thank you for choosing Swasth AI!`;
                            
                            // Simulate WhatsApp sharing
                            const whatsappUrl = `https://wa.me/919853224443?text=${encodeURIComponent(message)}`;
                            window.open(whatsappUrl, '_blank');
                            
                            setTimeout(() => {
                              alert(`✅ E-Bill sent to WhatsApp: 9853224443\n\n📋 Bill ID: ${eBill.id}\n🎫 Token: ${prescription.id.toUpperCase()}\n👨‍⚕️ Prescribed by: ${prescription.prescribedBy || prescription.doctorName}\n💰 Total: ₹${eBill.total}\n\n🎉 Medicine Ready for Pickup!\n\n📝 You can take away your medicines once dispatched under token number: ${prescription.id.toUpperCase()}\n\n🩺 Doctor's prescription has been fulfilled by our pharmacy\n\n📍 Apollo Pharmacy\n123 Main Street, Delhi\n📞 9876543300`);
                            }, 1000);
                          }}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Dispense & Send Bill
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Medicine Inventory ({filteredMedicines.length} items)</CardTitle>
                  <div className="flex gap-2">
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Search medicines..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredMedicines.map((medicine) => (
                      <div key={medicine.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <span className="font-medium">{medicine.name}</span>
                          <div className="text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded mr-2">{medicine.category}</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Demand: {medicine.demand}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{medicine.price}</div>
                          <Badge variant={medicine.stock < 100 ? 'destructive' : 'secondary'}>
                            Stock: {medicine.stock}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Demand Medicines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topDemandMedicines.map((medicine, index) => (
                    <div key={medicine.id} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        {medicine.name}
                      </span>
                      <Badge variant="secondary">{medicine.demand}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Category Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categoryDemand.map((cat) => (
                    <div key={cat.category} className="flex justify-between items-center text-sm">
                      <span>{cat.category}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{cat.count} items</Badge>
                        <Badge variant="secondary">{cat.demand}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Pill className="h-8 w-8 text-green-600 mx-auto" />
                  <h3 className="font-medium">Today's Stats</h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• {prescriptions.length} prescriptions received</p>
                    <p>• {prescriptions.filter(p => p.status === 'DISPENSED').length} doctor prescriptions dispensed</p>
                    <p>• {medicines.filter(m => m.stock < 100).length} stock alerts</p>
                    <p>• ₹{prescriptions.filter(p => p.status === 'DISPENSED').length * 450} estimated sales</p>
                    <p>• 📱 E-Bills sent to: 9853224443</p>
                    <p>• 🎫 Token-based pickup system</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <MapPin className="h-5 w-5" />
                  Store Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Apollo Pharmacy</p>
                    <p>123 Main Street, Delhi</p>
                    <p>Phone: 9876543300</p>
                  </div>
                  
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-sm">
                    📍 Interactive Map View
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        const address = "123 Main Street, Delhi";
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                        window.open(mapsUrl, '_blank');
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      View Map
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        const address = "123 Main Street, Delhi";
                        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
                        window.open(directionsUrl, '_blank');
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}