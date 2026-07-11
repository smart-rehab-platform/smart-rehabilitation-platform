import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/providers/auth_provider.dart';
import '../../models/admin_assignments_models.dart';
import '../../models/parent_links_models.dart';
import '../../providers/parent_links_provider.dart';
import '../../providers/session_requests_provider.dart';
import 'conversations_list_screen.dart';

class ParentMessageSpecialistButton extends ConsumerStatefulWidget {
  const ParentMessageSpecialistButton({super.key, required this.childId});

  final String childId;

  @override
  ConsumerState<ParentMessageSpecialistButton> createState() =>
      _ParentMessageSpecialistButtonState();
}

class _ParentMessageSpecialistButtonState
    extends ConsumerState<ParentMessageSpecialistButton> {
  bool _isOpening = false;

  PatientSpecialistLink? _pickSpecialist(List<PatientSpecialistLink> links) {
    if (links.isEmpty) {
      return null;
    }
    for (final link in links) {
      if (link.isPrimary) {
        return link;
      }
    }
    return links.first;
  }

  Future<void> _openConversation() async {
    if (_isOpening) {
      return;
    }

    final parentId = ref.read(authProvider).user?.id;
    if (parentId == null || parentId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sign in to send messages.')),
      );
      return;
    }

    setState(() => _isOpening = true);

    try {
      final specialists = await ref
          .read(sessionRequestsProvider.notifier)
          .fetchSpecialistsForPatient(widget.childId);
      final specialist = _pickSpecialist(specialists);

      if (!mounted) {
        return;
      }

      if (specialist == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No specialist is assigned to this child yet.'),
          ),
        );
        return;
      }

      await openOrCreateConversation(
        ref: ref,
        context: context,
        patientId: widget.childId,
        parentId: parentId,
        specialistId: specialist.specialistId,
        isParent: true,
      );
    } finally {
      if (mounted) {
        setState(() => _isOpening = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: _isOpening ? null : _openConversation,
      icon: _isOpening
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.chat_bubble_outline_rounded),
      label: Text(_isOpening ? 'Opening...' : 'Message Specialist'),
    );
  }
}

class SpecialistMessageParentButton extends ConsumerStatefulWidget {
  const SpecialistMessageParentButton({super.key, required this.patientId});

  final String patientId;

  @override
  ConsumerState<SpecialistMessageParentButton> createState() =>
      _SpecialistMessageParentButtonState();
}

class _SpecialistMessageParentButtonState
    extends ConsumerState<SpecialistMessageParentButton> {
  bool _isOpening = false;

  PatientGuardianLink? _pickParent(List<PatientGuardianLink> guardians) {
    if (guardians.isEmpty) {
      return null;
    }
    for (final guardian in guardians) {
      if (guardian.isPrimaryContact) {
        return guardian;
      }
    }
    return guardians.first;
  }

  Future<void> _openConversation() async {
    if (_isOpening) {
      return;
    }

    final specialistId = ref.read(authProvider).user?.id;
    if (specialistId == null || specialistId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sign in to send messages.')),
      );
      return;
    }

    setState(() => _isOpening = true);

    try {
      final token = ref.read(authProvider).token;
      if (token != null && token.isNotEmpty) {
        ref.read(authRepositoryProvider).setAuthToken(token);
      }

      final guardians = await ref
          .read(parentLinksRepositoryProvider)
          .fetchGuardians(widget.patientId);
      final parent = _pickParent(guardians);

      if (!mounted) {
        return;
      }

      if (parent == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No parent is linked to this patient yet.'),
          ),
        );
        return;
      }

      await openOrCreateConversation(
        ref: ref,
        context: context,
        patientId: widget.patientId,
        parentId: parent.parentId,
        specialistId: specialistId,
        isParent: false,
      );
    } finally {
      if (mounted) {
        setState(() => _isOpening = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: _isOpening ? null : _openConversation,
      icon: _isOpening
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.chat_bubble_outline_rounded),
      label: Text(_isOpening ? 'Opening...' : 'Message Parent'),
    );
  }
}
