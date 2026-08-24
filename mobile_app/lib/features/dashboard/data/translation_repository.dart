import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../../core/utils/api_response_parser.dart';

/// Session cache + backend batch translation for exercise display content.
class TranslationRepository {
  TranslationRepository(this._dio);

  final Dio _dio;
  final Map<String, String> _cache = {};

  String _cacheKey(String text, String targetLanguage) =>
      '$targetLanguage::$text';

  Future<List<String>> translateTexts({
    required List<String> texts,
    required String targetLanguage,
  }) async {
    final target = targetLanguage.trim().toLowerCase().split('-').first;
    final input = texts.map((t) => t).toList();

    if (target.isEmpty || target == 'en' || input.isEmpty) {
      return input;
    }

    final result = List<String>.from(input);
    final pendingIndexes = <int>[];
    final pendingTexts = <String>[];

    for (var i = 0; i < input.length; i++) {
      final trimmed = input[i].trim();
      if (trimmed.isEmpty) {
        continue;
      }
      final key = _cacheKey(trimmed, target);
      final cached = _cache[key];
      if (cached != null) {
        result[i] = cached;
        continue;
      }
      pendingIndexes.add(i);
      pendingTexts.add(trimmed);
    }

    if (pendingTexts.isEmpty) {
      return result;
    }

    try {
      final response = await _dio.post(
        '/translations',
        data: {
          'texts': pendingTexts,
          'targetLanguage': target,
        },
      );
      final map = ApiResponseParser.extractMap(response.data);
      final translated = map == null
          ? null
          : (map['texts'] is List
              ? (map['texts'] as List)
                  .map((item) => item?.toString() ?? '')
                  .toList()
              : null);

      if (translated == null || translated.length != pendingTexts.length) {
        return input;
      }

      for (var i = 0; i < translated.length; i++) {
        final original = pendingTexts[i];
        final value = translated[i].isEmpty ? original : translated[i];
        _cache[_cacheKey(original, target)] = value;
        result[pendingIndexes[i]] = value;
      }

      return result;
    } catch (_) {
      return input;
    }
  }

  Future<({String title, String description, String instructions})>
      translateExerciseFields({
    required String title,
    String? description,
    String? instructions,
    required String targetLanguage,
  }) async {
    final translated = await translateTexts(
      texts: [title, description ?? '', instructions ?? ''],
      targetLanguage: targetLanguage,
    );
    return (
      title: translated[0],
      description: translated[1],
      instructions: translated[2],
    );
  }
}

final translationRepositoryProvider = Provider<TranslationRepository>((ref) {
  return TranslationRepository(ref.watch(dioProvider));
});
