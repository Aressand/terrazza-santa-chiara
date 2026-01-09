"use client";

// src/app/admin/page.tsx - Admin Dashboard

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, TrendingUp, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ICalSyncTester from '@/components/admin/ICalSyncTester';

export default function AdminDashboard() {
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);

  const handleCleanup = async () => {
    setCleanupLoading(true);
    setCleanupResult(null);
    try {
      const res = await fetch('/api/bookings/cleanup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCleanupResult(`Eliminate ${data.deletedCount} prenotazioni abbandonate`);
      } else {
        setCleanupResult('Errore durante la pulizia');
      }
    } catch {
      setCleanupResult('Errore di connessione');
    } finally {
      setCleanupLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-playfair text-sage">
            Welcome to Admin Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage your B&B pricing, availability, and bookings from this central dashboard.
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€1,240</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Price Management */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-sage" />
              Price Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Set custom prices for specific dates and manage seasonal rates.
            </p>
            <Button className="w-full" asChild>
              <Link href="/admin/price-management">
                Manage Prices
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-sage" />
              Availability Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Block or unblock specific dates for maintenance or personal use.
            </p>
            <Button className="w-full" asChild>
              <Link href="/admin/availability">
                Manage Availability
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              iCal Sync Tester
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Test calendar synchronization functionality.
            </p>
            <Button className="w-full" asChild>
              <Link href="/admin/ical-tester">
                Open Tester
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trash2 className="h-5 w-5 mr-2 text-sage" />
              Pulizia Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Elimina prenotazioni abbandonate (awaiting_payment &gt; 30 min).
            </p>
            <Button
              className="w-full"
              onClick={handleCleanup}
              disabled={cleanupLoading}
            >
              {cleanupLoading ? 'Pulizia in corso...' : 'Pulisci ora'}
            </Button>
            {cleanupResult && (
              <p className="text-sm text-center mt-2 text-muted-foreground">
                {cleanupResult}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Message */}
      <Card className="border-sage/20 bg-sage/5">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <p className="text-sm font-medium">System Status: All systems operational</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
