"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Building2, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle,
  MapPin,
  Tag,
  Search,
  TrendingUp
} from "lucide-react";
import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVMetric,
} from "@/components/blve";

export default function MerchantsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin
