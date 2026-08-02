function clampScore(score) {
  return Math.max(0, Math.min(100, score));
}

function buildPlotPoints(scores, width, height, padding = 8) {
  if (!scores.length) {
    return [];
  }

  const plotWidth = Math.max(width - padding * 2, 1);
  const plotHeight = Math.max(height - padding * 2, 1);
  const clampedScores = scores.map(clampScore);
  const minScore = Math.min(...clampedScores);
  const maxScore = Math.max(...clampedScores);
  const scoreRange = maxScore - minScore;

  const getY = (score) => {
    if (scoreRange < 1) {
      const center = clampedScores[0];
      const band = 10;
      const plotMin = Math.max(0, center - band);
      const plotMax = Math.min(100, center + band);
      const plotSpan = Math.max(plotMax - plotMin, 1);
      const normalized = (clampScore(score) - plotMin) / plotSpan;
      return padding + plotHeight - normalized * plotHeight;
    }

    const paddingRatio = 0.06;
    const inset = Math.max(scoreRange * paddingRatio, 1.5);
    const plotMin = Math.max(0, minScore - inset);
    const plotMax = Math.min(100, maxScore + inset);
    const plotSpan = Math.max(plotMax - plotMin, 1);
    const normalized = (clampScore(score) - plotMin) / plotSpan;
    return padding + plotHeight - normalized * plotHeight;
  };

  if (scores.length === 1) {
    const x = padding + plotWidth / 2;
    return [{ x, y: getY(scores[0]), index: 0 }];
  }

  return scores.map((score, index) => {
    const x = padding + (plotWidth * index) / (scores.length - 1);
    return { x, y: getY(score), index };
  });
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

export function TreatmentJourneySparkline({
  scores = [],
  width = 320,
  height = 106,
  className = "",
}) {
  if (!scores.length) {
    return null;
  }

  const padding = 4;
  const plotPoints = buildPlotPoints(scores, width, height, padding);
  const baselineY = height - padding;
  const linePoints = plotPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPath = buildAreaPath(plotPoints, baselineY);
  const lastPoint = plotPoints[plotPoints.length - 1];

  return (
    <div className={`pd-tj-sparkline-wrap ${className}`.trim()}>
      <svg
        className="pd-tj-sparkline"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path d={areaPath} className="pd-tj-sparkline-area" />
        <polyline
          points={linePoints}
          fill="none"
          className="pd-tj-sparkline-line"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {plotPoints.slice(0, -1).map((point) => (
          <circle
            key={`spark-point-${point.index}`}
            cx={point.x}
            cy={point.y}
            r="2.5"
            className="pd-tj-sparkline-point"
          />
        ))}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="7"
          className="pd-tj-sparkline-point-ring"
        />
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="4.5"
          className="pd-tj-sparkline-point-latest"
        />
      </svg>
    </div>
  );
}
