import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { CommonModule } from '@angular/common';
import {
  lucideHome,
  lucideUsers,
  lucideFileText,
  lucideTrendingUp,
  lucideArrowRight,
  lucidePlusCircle,
  lucideBuilding,
} from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  NgApexchartsModule,
  ApexPlotOptions,
  ApexYAxis,
  ApexFill,
  ApexLegend,
  ApexNonAxisChartSeries
} from 'ng-apexcharts';
import { AuthService } from '../../../../core/auth/services/auth.service';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  fill: ApexFill;
  legend: ApexLegend;
  labels: string[];
  colors: string[];
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIconComponent, RouterLink, NgApexchartsModule],
  providers: [
    provideIcons({
      lucideHome,
      lucideUsers,
      lucideFileText,
      lucideTrendingUp,
      lucideArrowRight,
      lucidePlusCircle,
      lucideBuilding,
    }),
  ],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  
  public revenueChartOptions!: ChartOptions;
  public propertiesChartOptions!: ChartOptions;

  userName = this.authService.user()?.prenom || 'Propriétaire';

  stats = [
    { title: 'Total Propriétés', value: '12', icon: 'lucideHome', trend: '+2', bg: 'bg-blue-50', text: 'text-blue-600' },
    { title: 'Taux Occupation', value: '85%', icon: 'lucideTrendingUp', trend: '+1.5%', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { title: 'Locataires Actifs', value: '89', icon: 'lucideUsers', trend: '+5', bg: 'bg-purple-50', text: 'text-purple-600' },
    { title: 'Contrats en Cours', value: '92', icon: 'lucideFileText', trend: 'Stable', bg: 'bg-gray-100', text: 'text-gray-600' },
  ];

  recentActivities = [
    { type: 'property', desc: 'Nouvelle propriété ajoutée: "Immeuble Corniche"', date: 'Il y a 2h' },
    { type: 'contract', desc: 'Contrat signé par "Jean Dupont"', date: 'Il y a 5h' },
    { type: 'tenant', desc: 'Nouveau locataire enregistré: "Marie Curie"', date: 'Hier' },
    { type: 'system', desc: 'Maintenance prévue sur l\'unité A-12', date: 'Il y a 2 jours' },
  ];

  ngOnInit() {
    this.initRevenueChart();
    this.initPropertiesChart();
  }

  private initRevenueChart(): void {
    this.revenueChartOptions = {
      series: [
        {
          name: 'Revenus (FCFA)',
          data: [1500000, 1800000, 1400000, 2100000, 2400000, 2600000]
        }
      ],
      chart: {
        type: 'area',
        fontFamily: 'inherit',
        height: 300,
        toolbar: { show: false }
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2, colors: ['#4f46e5'] },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: function(val: number) {
            return (val / 1000).toFixed(0) + " k";
          }
        }
      },
      tooltip: { theme: 'light' }
    } as any;
  }

  private initPropertiesChart(): void {
    this.propertiesChartOptions = {
       series: [85, 12, 3],
       chart: {
          type: 'donut',
          height: 300,
          fontFamily: 'inherit',
       },
       labels: ['Louées', 'Vacantes', 'En maintenance'],
       colors: ['#10b981', '#f59e0b', '#ef4444'],
       plotOptions: {
          pie: {
             donut: {
                size: '70%',
                labels: {
                   show: true,
                   name: { show: true },
                   value: { show: true }
                }
             }
          }
       },
       dataLabels: { enabled: false },
       legend: { position: 'bottom' }
    } as any;
  }
}
