import '../../../core/utils/api_response_parser.dart';

/// weekOffset=0 current week, -1 previous week, -2 two weeks ago, 1 next week.
int normalizeWeeklyInteractionsWeekOffset(int weekOffset) {
  if (weekOffset < -52) {
    return -52;
  }
  if (weekOffset > 52) {
    return 52;
  }
  return weekOffset;
}

/// Patient entry returned for a daily interaction snapshot.
class SpecialistWeeklyInteractionPatient {
  const SpecialistWeeklyInteractionPatient({
    required this.id,
    required this.name,
  });

  final String id;
  final String name;

  factory SpecialistWeeklyInteractionPatient.fromMap(Map<String, dynamic> map) {
    return SpecialistWeeklyInteractionPatient(
      id: (map['id'] ?? map['_id'] ?? '').toString(),
      name: (map['name'] ?? map['full_name'] ?? map['fullName'] ?? 'Patient')
          .toString(),
    );
  }
}

/// Daily unique-patient interaction snapshot for the specialist dashboard chart.
class SpecialistWeeklyInteractionDay {
  const SpecialistWeeklyInteractionDay({
    required this.date,
    required this.patients,
    this.dayLabel,
  });

  final DateTime date;
  final String? dayLabel;
  final List<SpecialistWeeklyInteractionPatient> patients;

  List<String> get patientNames =>
      patients.map((patient) => patient.name).toList(growable: false);

  int get count => patients.length;

  factory SpecialistWeeklyInteractionDay.fromMap(Map<String, dynamic> map) {
    final rawDate = map['date'];
    DateTime date;
    if (rawDate is DateTime) {
      date = DateTime(rawDate.year, rawDate.month, rawDate.day);
    } else if (rawDate is String) {
      final parsed = DateTime.tryParse(rawDate);
      date = parsed == null
          ? DateTime.now()
          : DateTime(parsed.year, parsed.month, parsed.day);
    } else {
      date = DateTime.now();
    }

    final rawPatients = map['patients'];
    final patients = rawPatients is List
        ? rawPatients
              .whereType<Map>()
              .map(
                (item) => SpecialistWeeklyInteractionPatient.fromMap(
                  item.map((key, value) => MapEntry(key.toString(), value)),
                ),
              )
              .toList(growable: false)
        : _patientsFromLegacyNames(map);

    return SpecialistWeeklyInteractionDay(
      date: date,
      dayLabel: map['day']?.toString() ?? map['day_label']?.toString(),
      patients: patients,
    );
  }

  static List<SpecialistWeeklyInteractionPatient> _patientsFromLegacyNames(
    Map<String, dynamic> map,
  ) {
    final rawNames = map['patient_names'] ?? map['patientNames'];
    if (rawNames is! List) {
      return const [];
    }

    return rawNames
        .whereType<String>()
        .map(
          (name) => SpecialistWeeklyInteractionPatient(id: name, name: name),
        )
        .toList(growable: false);
  }
}

/// Weekly unique-patient interaction data for the specialist dashboard chart.
class SpecialistWeeklyInteractionsData {
  const SpecialistWeeklyInteractionsData({
    required this.weekOffset,
    required this.days,
    this.weekLabel,
    this.totalUniquePatients,
  });

  /// `0` = current week, `-1` = previous week, `1` = next week.
  final int weekOffset;
  final String? weekLabel;
  final int? totalUniquePatients;

  /// Seven entries ordered Monday → Sunday.
  final List<SpecialistWeeklyInteractionDay> days;

  int get weeklyUniquePatientCount {
    if (totalUniquePatients != null) {
      return totalUniquePatients!;
    }

    final uniquePatientIds = <String>{};
    for (final day in days) {
      for (final patient in day.patients) {
        uniquePatientIds.add(patient.id);
      }
    }
    return uniquePatientIds.length;
  }

  factory SpecialistWeeklyInteractionsData.fromMap(
    Map<String, dynamic> map, {
    int? requestedWeekOffset,
  }) {
    final rawDays = map['days'] as List? ?? const [];
    return SpecialistWeeklyInteractionsData(
      weekOffset:
          requestedWeekOffset ??
          map['week_offset'] ??
          map['weekOffset'] ??
          0,
      weekLabel: map['week_label']?.toString() ?? map['weekLabel']?.toString(),
      totalUniquePatients: ApiResponseParser.readInt(map, const [
        'total_unique_patients',
        'totalUniquePatients',
      ]),
      days: rawDays
          .whereType<Map>()
          .map(
            (item) => SpecialistWeeklyInteractionDay.fromMap(
              item.map((key, value) => MapEntry(key.toString(), value)),
            ),
          )
          .toList(growable: false),
    );
  }

  factory SpecialistWeeklyInteractionsData.empty({required int weekOffset}) {
    final today = DateTime.now();
    final normalizedToday = DateTime(today.year, today.month, today.day);
    final weekStart = startOfWeekMonday(
      normalizedToday,
    ).add(Duration(days: weekOffset * 7));

    return SpecialistWeeklyInteractionsData(
      weekOffset: weekOffset,
      days: List.generate(
        7,
        (index) => SpecialistWeeklyInteractionDay(
          date: weekStart.add(Duration(days: index)),
          patients: const [],
        ),
      ),
    );
  }
}

DateTime startOfWeekMonday(DateTime date) {
  final normalized = DateTime(date.year, date.month, date.day);
  return normalized.subtract(
    Duration(days: normalized.weekday - DateTime.monday),
  );
}

bool isSameCalendarDay(DateTime a, DateTime b) {
  return a.year == b.year && a.month == b.month && a.day == b.day;
}
