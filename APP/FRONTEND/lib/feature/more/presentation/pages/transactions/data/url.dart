import 'package:ionhive/core/core.dart';

class Transactionurl {
  static final String Fetchtransactions =
      '${iOnHiveCore.baseUrl}/wallet/FetchTransactionDetails';
  static final String SaveTransactionfilter =
      '${iOnHiveCore.baseUrl}/wallet/saveTransactionFilter';
  static final String Fetchtransactionfilter =
      '${iOnHiveCore.baseUrl}/wallet/fetchTransactionFilter';
  static final String Clearsavedfilter =
      '${iOnHiveCore.baseUrl}/wallet/clearTransactionFilter';
}