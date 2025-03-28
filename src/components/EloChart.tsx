'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { PlayerWithId } from '@/types/player';
import { getCurrentWeek } from '@/lib/date-utils';

// Register Chart.js components
Chart.register(...registerables);

// Pastel colors for player lines
const PASTEL_COLORS = [
  '#FFB6C1', // Light Pink
  '#ADD8E6', // Light Blue
  '#90EE90', // Light Green
  '#FFFFE0', // Light Yellow
  '#E6E6FA', // Lavender
  '#FFDAB9', // Peach
  '#B0E0E6', // Powder Blue
  '#F5DEB3', // Wheat
  '#D8BFD8', // Thistle
  '#FAFAD2', // Light Goldenrod
];

interface EloChartProps {
  players: PlayerWithId[];
  maxWeeks: number;
}

export default function EloChart({ players, maxWeeks }: EloChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current || players.length === 0) return;
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Get current week information - we only need the dateRange for the label
    const { dateRange: currentDateRange } = getCurrentWeek();
    
    // Create datasets with current Elo values only
    const datasets = players.map((player, index) => {
      // Assign a pastel color to each player
      const colorIndex = index % PASTEL_COLORS.length;
      
      return {
        label: player.name,
        data: [player.currentElo], // Just a single data point with current Elo
        fill: false,
        borderWidth: 2,
        tension: 0.1,
        borderColor: PASTEL_COLORS[colorIndex],
        backgroundColor: PASTEL_COLORS[colorIndex],
        pointRadius: 6,
        pointHoverRadius: 8,
      };
    });
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [currentDateRange], // Just one label for the current week
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              title: {
                display: true,
                text: 'Elo',
                font: {
                  weight: 'bold',
                  size: 16
                }
              },
              grid: {
                color: '#e0e0e0'
              },
              border: {
                width: 2,
                color: '#000000'
              },
              ticks: {
                font: {
                  size: 14
                }
              },
              // Set an appropriate min/max to show a good range around 1500
              min: 1420,
              max: 1580,
              suggestedMin: 1420,
              suggestedMax: 1580
            },
            x: {
              title: {
                display: true,
                text: 'Week',
                font: {
                  weight: 'bold',
                  size: 16
                }
              },
              grid: {
                color: '#e0e0e0'
              },
              border: {
                width: 2,
                color: '#000000'
              },
              ticks: {
                font: {
                  size: 14
                }
              }
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  size: 14,
                  weight: 'bold'
                },
                boxWidth: 30,
                padding: 20
              }
            },
            tooltip: {
              backgroundColor: '#000000',
              titleFont: {
                size: 14
              },
              bodyFont: {
                size: 14
              },
              padding: 10,
              cornerRadius: 0,
              displayColors: true
            }
          }
        }
      });
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [players, maxWeeks]);
  
  return (
    <div className="mb-8">
      <h2 className="text-5xl font-bold mb-4">Elo Rating</h2>
      <div className="border-2 border-black p-4">
        <div style={{ height: '500px', width: '100%' }}>
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
} 