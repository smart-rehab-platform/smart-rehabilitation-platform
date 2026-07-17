import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../dashboard/widgets/dashboard_layout.dart';
import '../../dashboard/widgets/dashboard_surface_card.dart';
import '../../dashboard/widgets/parent_dashboard_cards.dart';
import '../models/case_intake_request_model.dart';
import '../providers/parent_case_intake_provider.dart';
import 'case_request_status_chip.dart';

/// Parent-home Case Intake block: onboarding, featured request, or secondary card.
class ParentDashboardCaseIntakeSection extends StatelessWidget {
  const ParentDashboardCaseIntakeSection({
    super.key,
    required this.hasLinkedChildren,
    required this.caseIntakeState,
    required this.featuredRequest,
    required this.onRetry,
    required this.onSubmitNewRequest,
    required this.onViewAllRequests,
    required this.onViewRequest,
    required this.onOpenConversation,
    required this.onSubmitAnotherRequest,
  });

  final bool hasLinkedChildren;
  final ParentCaseIntakeState caseIntakeState;
  final CaseIntakeRequest? featuredRequest;
  final VoidCallback onRetry;
  final VoidCallback onSubmitNewRequest;
  final VoidCallback onViewAllRequests;
  final ValueChanged<CaseIntakeRequest> onViewRequest;
  final ValueChanged<CaseIntakeRequest> onOpenConversation;
  final VoidCallback onSubmitAnotherRequest;

  @override
  Widget build(BuildContext context) {
    final isInitialLoading =
        caseIntakeState.isLoading && caseIntakeState.requests.isEmpty;
    final hasError =
        caseIntakeState.errorMessage != null &&
        caseIntakeState.errorMessage!.isNotEmpty;

    if (isInitialLoading) {
      return const Padding(
        padding: EdgeInsets.only(bottom: 8),
        child: DashboardLoadingCard(message: 'Loading case requests...'),
      );
    }

    if (hasError && caseIntakeState.requests.isEmpty) {
      return Padding(
        padding: EdgeInsets.only(bottom: context.dashSpacing * 0.75),
        child: DashboardErrorCard(
          message: caseIntakeState.errorMessage!,
          onRetry: onRetry,
        ),
      );
    }

    if (featuredRequest == null) {
      if (hasLinkedChildren) {
        return const SizedBox.shrink();
      }
      return _OnboardingCard(
        onSubmitNewRequest: onSubmitNewRequest,
        onViewAllRequests: onViewAllRequests,
      );
    }

    if (hasLinkedChildren) {
      return _SecondaryFeaturedCard(
        request: featuredRequest!,
        onViewRequest: () => onViewRequest(featuredRequest!),
        onOpenConversation: _canOpenConversation(featuredRequest!)
            ? () => onOpenConversation(featuredRequest!)
            : null,
        onViewAllRequests: onViewAllRequests,
      );
    }

    if (featuredRequest!.status == CaseIntakeStatus.rejected) {
      return _RejectedFeaturedCard(
        request: featuredRequest!,
        onViewRequest: () => onViewRequest(featuredRequest!),
        onSubmitAnotherRequest: onSubmitAnotherRequest,
        onViewAllRequests: onViewAllRequests,
      );
    }

    return _ActiveFeaturedCard(
      request: featuredRequest!,
      onViewRequest: () => onViewRequest(featuredRequest!),
      onOpenConversation: _canOpenConversation(featuredRequest!)
          ? () => onOpenConversation(featuredRequest!)
          : null,
      onViewAllRequests: onViewAllRequests,
      conversationUnavailableHint: _shouldShowConversationHint(
        featuredRequest!,
      ),
    );
  }

  bool _canOpenConversation(CaseIntakeRequest request) {
    final id = request.conversationId;
    return id != null && id.isNotEmpty;
  }

  bool _shouldShowConversationHint(CaseIntakeRequest request) {
    return (request.status?.conversationAvailable ?? false) &&
        !_canOpenConversation(request);
  }
}

class _OnboardingCard extends StatelessWidget {
  const _OnboardingCard({
    required this.onSubmitNewRequest,
    required this.onViewAllRequests,
  });

  final VoidCallback onSubmitNewRequest;
  final VoidCallback onViewAllRequests;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            "Start Your Child's Follow-Up Journey",
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.4),
          Text(
            'Tell us about the observed condition. The admin team will review the request and assign a suitable specialist.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            'The selected category is preliminary and does not represent a medical diagnosis.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textMuted,
              fontStyle: FontStyle.italic,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.85),
          FilledButton(
            onPressed: onSubmitNewRequest,
            child: const Text('Submit New Case Request'),
          ),
          SizedBox(height: context.dashSpacing * 0.4),
          OutlinedButton(
            onPressed: onViewAllRequests,
            child: const Text('View Case Requests'),
          ),
        ],
      ),
    );
  }
}

class _ActiveFeaturedCard extends StatelessWidget {
  const _ActiveFeaturedCard({
    required this.request,
    required this.onViewRequest,
    required this.onViewAllRequests,
    this.onOpenConversation,
    this.conversationUnavailableHint = false,
  });

  final CaseIntakeRequest request;
  final VoidCallback onViewRequest;
  final VoidCallback onViewAllRequests;
  final VoidCallback? onOpenConversation;
  final bool conversationUnavailableHint;

  @override
  Widget build(BuildContext context) {
    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Case Request',
            style: Theme.of(
              context,
            ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          SizedBox(height: context.dashSpacing * 0.55),
          _RequestSummary(request: request),
          if (conversationUnavailableHint) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              'Conversation becomes available after specialist assignment.',
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(color: DashboardColors.textMuted),
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.75),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilledButton(
                onPressed: onViewRequest,
                child: const Text('View Request'),
              ),
              if (onOpenConversation != null)
                OutlinedButton(
                  onPressed: onOpenConversation,
                  child: const Text('Open Conversation'),
                ),
              TextButton(
                onPressed: onViewAllRequests,
                child: const Text('View All Requests'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RejectedFeaturedCard extends StatelessWidget {
  const _RejectedFeaturedCard({
    required this.request,
    required this.onViewRequest,
    required this.onSubmitAnotherRequest,
    required this.onViewAllRequests,
  });

  final CaseIntakeRequest request;
  final VoidCallback onViewRequest;
  final VoidCallback onSubmitAnotherRequest;
  final VoidCallback onViewAllRequests;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final reason = request.rejectionReason?.trim().isNotEmpty == true
        ? request.rejectionReason!.trim()
        : 'No rejection reason was provided.';

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Case Request Update',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              CaseRequestStatusChip(status: request.status),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.45),
          Text(
            request.childName,
            style: theme.textTheme.bodyLarge?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            reason,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilledButton(
                onPressed: onSubmitAnotherRequest,
                child: const Text('Submit Another Request'),
              ),
              OutlinedButton(
                onPressed: onViewRequest,
                child: const Text('View Request'),
              ),
              TextButton(
                onPressed: onViewAllRequests,
                child: const Text('View All Requests'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SecondaryFeaturedCard extends StatelessWidget {
  const _SecondaryFeaturedCard({
    required this.request,
    required this.onViewRequest,
    required this.onViewAllRequests,
    this.onOpenConversation,
  });

  final CaseIntakeRequest request;
  final VoidCallback onViewRequest;
  final VoidCallback onViewAllRequests;
  final VoidCallback? onOpenConversation;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Active Case Request',
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w800,
            color: DashboardColors.textPrimary,
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.45),
        DashboardSurfaceCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _RequestSummary(request: request),
              SizedBox(height: context.dashSpacing * 0.65),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  FilledButton(
                    onPressed: onViewRequest,
                    child: const Text('View Request'),
                  ),
                  if (onOpenConversation != null)
                    OutlinedButton(
                      onPressed: onOpenConversation,
                      child: const Text('Open Conversation'),
                    ),
                  TextButton(
                    onPressed: onViewAllRequests,
                    child: const Text('View All Requests'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _RequestSummary extends StatelessWidget {
  const _RequestSummary({required this.request});

  final CaseIntakeRequest request;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final submittedLabel = request.submittedAt != null
        ? DateFormat('MMM d, yyyy').format(request.submittedAt!)
        : 'Date unavailable';
    final specialistName = request.assignedSpecialist?.fullName?.trim();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                request.childName,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: DashboardColors.textPrimary,
                ),
              ),
            ),
            CaseRequestStatusChip(status: request.status),
          ],
        ),
        if (request.category?.name != null &&
            request.category!.name.isNotEmpty) ...[
          SizedBox(height: context.dashSpacing * 0.3),
          Text(
            request.category!.name,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
        SizedBox(height: context.dashSpacing * 0.25),
        Text(
          'Submitted $submittedLabel',
          style: theme.textTheme.bodySmall?.copyWith(
            color: DashboardColors.textSecondary,
          ),
        ),
        if (specialistName != null && specialistName.isNotEmpty) ...[
          SizedBox(height: context.dashSpacing * 0.3),
          Text(
            specialistName,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
        if (request.status != null) ...[
          SizedBox(height: context.dashSpacing * 0.3),
          Text(
            request.status!.subtitle,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
        ],
      ],
    );
  }
}
