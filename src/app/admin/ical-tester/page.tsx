"use client";

// src/app/admin/ical-tester/page.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ICalHookTester from '@/components/admin/ICalHookTester';

export default function ICalTester() {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Hook Tester Component */}
      <ICalHookTester />
    </div>
  );
}
