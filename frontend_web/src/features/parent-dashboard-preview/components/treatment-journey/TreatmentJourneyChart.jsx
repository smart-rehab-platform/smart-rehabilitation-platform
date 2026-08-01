import { useEffect, useMemo, useState } from "react";
import {
  calculateXAxisLabelIndices,
  formatChartXAxisLabel,
  formatTreatmentJourneyDisplayDate,
  formatTreatmentJourneyImprovement,
  formatTreatmentJourneyPercent,
  journeyHasData,
} from "../../utils/parentTreatmentJourneyUtils";

const CHART_HEIGHT = 260;
const PADDING = { top: 16, right: 16, bottom: 28, left: 36 };

function clampScore(score) {
  return Math.max(0, Math.min(100, score));
}

function buildPlotGeometry(width, height, scores) {
  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 1);
  const plotHeight = Math.max(height - PADDING.top - PADDING.bottom, 1);

  const points = scores.map((score, index) => {
    const x = PADDING.left + (scores.length === 1
      ? plotWidth / 2
      : (plotWidth * index) / (scores.length - 1));
    const y = PADDING.top + plotHeight - (clampScore(score) / 100) * plotHeight;
    return { x, y, score, index };
  });

  return { plotWidth, plotHeight, points };
}

function buildAreaPath(points, baselineY) {
  if (!points.length) {
    return "";
  }

  const line = points.map((point, index) => (
    `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
  )).join(" ");

  const last = points[points.length - 1];
  const first = points[0];

  return `${line} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

function findNearestPointIndex(localX, points) {
  if (!points.length) {
    return -1;
  }

  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  points.forEach((point) => {
    const distance = Math.abs(point.x - localX);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = point.index;
    }
  });

  return nearestIndex;
}

export function TreatmentJourneyChart({
  points = [],
  period = "weekly",
  isLoading = false,
  className = "",
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasData = journeyHasData({ chartPoints: points });

  useEffect(() => {
    if (!points.length) {
      setSelectedIndex(0);
      return;
    }

    setSelectedIndex(points.length - 1);
  }, [points, period]);

  const scores = useMemo(
    () => points.map((point) => point.score),
    [points],
  );

  const labelIndices = useMemo(
    () => calculateXAxisLabelIndices(points.length),
    [points.length],
  );

  const selectedPoint = points[selectedIndex] ?? points[points.length - 1] ?? null;
  const width = 640;
  const height = CHART_HEIGHT;
  const { points: plotPoints } = buildPlotGeometry(width, height, scores);
  const baselineY = PADDING.top + Math.max(height - PADDING.top - PADDING.bottom, 1);
  const linePath = plotPoints.map((point, index) => (
    `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
  )).join(" ");
  const areaPath = buildAreaPath(plotPoints, baselineY);
  const yTicks = [0, 25, 50, 75, 100];

  const handleKeyDown = (event) => {
    if (!points.length) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSelectedIndex((value) => Math.max(0, value - 1));
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setSelectedIndex((value) => Math.min(points.length - 1, value + 1));
    }
  };

  if (!hasData) {
    return (
      <section
        className={`pd-tj-chart pd-tj-chart-empty ${className}`.trim()}
        aria-label="Treatment progress chart, no data yet"
      >
        <p>Progress will appear after exercises are reviewed.</p>
      </section>
    );
  }

  const chartLabel = `Treatment progress chart with ${points.length} points`;

  return (
    <section className={`pd-tj-chart ${className}`.trim()} aria-label={chartLabel}>
      <div className="pd-tj-chart-shell">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height={height}
          role="img"
          aria-label={chartLabel}
          className="pd-tj-chart-svg"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const scaleX = width / rect.width;
            const localX = (event.clientX - rect.left) * scaleX;
            const nearest = findNearestPointIndex(localX, plotPoints);
            if (nearest >= 0) {
              setSelectedIndex(nearest);
            }
          }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {yTicks.map((tick) => {
            const y = PADDING.top + (height - PADDING.top - PADDING.bottom)
              - (tick / 100) * (height - PADDING.top - PADDING.bottom);
            return (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  x2={width - PADDING.right}
                  y1={y}
                  y2={y}
                  className="pd-tj-chart-grid-line"
                />
                <text
                  x={PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="pd-tj-chart-axis-label"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <path d={areaPath} className="pd-tj-chart-area" />
          <path d={linePath} className="pd-tj-chart-line" />

          {plotPoints.map((point) => {
            const isLatest = point.index === plotPoints.length - 1;
            const isSelected = point.index === selectedIndex;
            const radius = isSelected ? (isLatest ? 7 : 5.5) : (isLatest ? 5 : 3.5);

            return (
              <g key={`point-${point.index}`}>
                {isLatest ? (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={radius + 4}
                    className="pd-tj-chart-point-halo"
                  />
                ) : null}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={radius}
                  className={isSelected || isLatest
                    ? "pd-tj-chart-point is-selected"
                    : "pd-tj-chart-point"}
                />
              </g>
            );
          })}

          {labelIndices.map((index) => {
            const plotPoint = plotPoints[index];
            const labelPoint = points[index];
            if (!plotPoint || !labelPoint) {
              return null;
            }

            return (
              <text
                key={`label-${index}`}
                x={plotPoint.x}
                y={height - 8}
                textAnchor="middle"
                className="pd-tj-chart-axis-label"
              >
                {formatChartXAxisLabel(labelPoint.date, period)}
              </text>
            );
          })}
        </svg>

        {isLoading ? (
          <div className="pd-tj-chart-loading" aria-live="polite">
            <span className="pd-tj-chart-spinner" aria-hidden="true" />
            <span className="pd-inline-loading">Updating chart…</span>
          </div>
        ) : null}
      </div>

      {selectedPoint ? (
        <div
          className="pd-tj-chart-selected"
          aria-label={`Selected point score ${formatTreatmentJourneyPercent(selectedPoint.score)}, date ${formatTreatmentJourneyDisplayDate(selectedPoint.date)}`}
        >
          <div className="pd-tj-chart-selected-grid">
            <div>
              <span className="pd-tj-metric-label">Score</span>
              <strong>{formatTreatmentJourneyPercent(selectedPoint.score)}</strong>
            </div>
            <div>
              <span className="pd-tj-metric-label">Date</span>
              <strong>{formatTreatmentJourneyDisplayDate(selectedPoint.date)}</strong>
            </div>
            <div>
              <span className="pd-tj-metric-label">Exercises</span>
              <strong>{selectedPoint.exercisesCompleted ?? 0}</strong>
            </div>
            <div>
              <span className="pd-tj-metric-label">Improvement</span>
              <strong>{formatTreatmentJourneyImprovement(selectedPoint.improvementPercentage)}</strong>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
