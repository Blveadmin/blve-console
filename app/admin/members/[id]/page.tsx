"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  BLVPageContainer,
  BLVTotalsRow,
  BLVSeparationLine,
  BLVSectionHeader,
  BLVCard,
  BLVTwoColumn,
  BLVMetric,
  BLVSparkline,
} from "@/components/blve";

import {
  User,
  Activity,
  TrendingUp,
  Building2,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  name?: string;
  created_at: string;
  org_id?: string;
}

interface Organization {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  amount: number;
  routing_amount: number;
  timestamp: string;
  member_id: string;
}

interface OrgDashboardResponse {
  members?: Member[];
  orgs?: Organization[];
  transactions?: Transaction[];
  error?: string;
}

const SPARK_TX = [1, 2, 3, 4, 3, 5, 6, 7, 6, 8];
const SPARK_ROUTING = [5, 8, 10, 12, 11, 15, 14, 18, 17, 20];
const SPARK_VOLUME = [20, 25, 22, 
