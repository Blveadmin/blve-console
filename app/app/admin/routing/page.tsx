  const totalsMetrics = [
    {
      label: "Total Routed Amount",
      value: `$${(summary.total_routed || 0).toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Network Routing Pool",
      value: `$${(summary.total_pool || 0).toLocaleString()}`,
      icon: <ShieldCheck size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
    {
      label: "Avg Routing %",
      value: `${(summary.avg_routing_percentage || 0).toFixed(2)}%`,
      trend: { value: 1.2, direction: "up" as const },
      icon: <Activity size={24} />,
    },
    {
      label: "Active Nodes",
      value: orgs.length,
      icon: <Building2 size={24} />,
      trend: { value: 0, direction: "up" as const },
    },
  ];
