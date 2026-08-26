import 'package:flutter/material.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/specialist_ai_recommendations_models.dart';

/// Badge color for AI recommendation status.
///
/// Maps by [AiRecommendationStatus] enum value (not translated label text).
/// Pending / accepted keep the prior green look from [DashboardPriorityBadge]'s
/// default (`lowPriority`). Rejected uses the shared error/red token.
Color aiRecommendationStatusBadgeColor(AiRecommendationStatus status) {
  switch (status) {
    case AiRecommendationStatus.rejected:
      return DashboardColors.highPriority;
    case AiRecommendationStatus.accepted:
    case AiRecommendationStatus.pending:
    case AiRecommendationStatus.unknown:
      return DashboardColors.lowPriority;
  }
}
