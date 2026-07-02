import 'package:flutter/material.dart';



import '../../../core/constants/admin_dashboard_colors.dart';



class AdminStatusBadge extends StatelessWidget {

  const AdminStatusBadge({

    super.key,

    required this.label,

    required this.color,

  });



  final String label;

  final Color color;



  factory AdminStatusBadge.sessionStatus(String? status, {bool isPastScheduled = false}) {

    final normalized = (status ?? 'unknown').toLowerCase();

    switch (normalized) {

      case 'completed':

        return AdminStatusBadge(

          label: 'Completed',

          color: AdminDashboardColors.success,

        );

      case 'cancelled':

        return AdminStatusBadge(

          label: 'Cancelled',

          color: AdminDashboardColors.danger,

        );

      case 'no_show':

        return AdminStatusBadge(

          label: 'No Show',

          color: AdminDashboardColors.warning,

        );

      case 'scheduled':

        return AdminStatusBadge(

          label: isPastScheduled ? 'Not Completed' : 'Scheduled',

          color: isPastScheduled

              ? AdminDashboardColors.warning

              : AdminDashboardColors.primary,

        );

      case 'pending':

        return AdminStatusBadge(

          label: 'Pending',

          color: AdminDashboardColors.warning,

        );

      case 'inactive':

      case 'disabled':

        return AdminStatusBadge(

          label: 'Inactive',

          color: AdminDashboardColors.inactive,

        );

      default:

        return AdminStatusBadge(

          label: normalized.replaceAll('_', ' '),

          color: AdminDashboardColors.inactive,

        );

    }

  }



  factory AdminStatusBadge.pending() => const AdminStatusBadge(

        label: 'Pending',

        color: AdminDashboardColors.warning,

      );



  @override

  Widget build(BuildContext context) {

    return Container(

      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),

      decoration: BoxDecoration(

        color: color.withValues(alpha: 0.12),

        borderRadius: BorderRadius.circular(999),

        border: Border.all(color: color.withValues(alpha: 0.3)),

      ),

      child: Text(
        label,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        softWrap: true,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.2,
            ),
      ),

    );

  }

}


