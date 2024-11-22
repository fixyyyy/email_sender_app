"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAnalyticsStore } from "@/lib/store/analytics-store";

export function Analytics() {
  const { data, getStats } = useAnalyticsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Delivery Rate</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.deliveryRate.toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground">
            {stats.totalDelivered} of {stats.totalSent} emails delivered
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Sent</h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalSent}
          </p>
          <p className="text-sm text-muted-foreground">Last 7 days</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Failure Rate</h3>
          <p className="text-3xl font-bold text-red-600">
            {stats.failureRate.toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground">
            {stats.totalFailed} of {stats.totalSent} emails failed
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Email Performance</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sent" 
                stroke="#6366f1" 
                strokeWidth={2} 
                name="Sent"
              />
              <Line 
                type="monotone" 
                dataKey="delivered" 
                stroke="#22c55e" 
                strokeWidth={2} 
                name="Delivered"
              />
              <Line 
                type="monotone" 
                dataKey="failed" 
                stroke="#ef4444" 
                strokeWidth={2} 
                name="Failed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}