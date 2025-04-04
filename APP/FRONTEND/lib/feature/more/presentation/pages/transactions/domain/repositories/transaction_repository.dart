 import 'package:ionhive/feature/more/presentation/pages/transactions/data/api.dart';
import 'package:ionhive/feature/more/presentation/pages/transactions/domain/models/transation_model.dart';

class Transactionrepository{
   final Transactionapicalls _api = Transactionapicalls();

   Future<FetchAllTransactionResponse> fetchAllTransactions(
       String email, int userId, String authToken) async {
     try {
       final responseJson = await _api.Fetchalltransactions(email, userId, authToken);
       print("Raw API Response: $responseJson"); // Debugging
       return FetchAllTransactionResponse.fromJson(responseJson);
     } catch (e) {
       print("Error in fetchAllTransactions: $e");
       rethrow; // Re-throw for handling in controller
     }
   }


   Future<SaveFilterResponse> SaveFilter(
       String email, int userId, String authToken,int? days) async {
     try {
       final responseJson = await _api.SaveTransactionfilter(email, userId, authToken,days);
       print("Raw API Response: $responseJson"); // Debugging
       return SaveFilterResponse.fromJson(responseJson);
     } catch (e) {
       print("Error in fetchAllTransactions: $e");
       rethrow; // Re-throw for handling in controller
     }
   }

   Future<FetchTransactionFilter> fetchTransactionFilterRep(
       String email, int userId, String authToken) async {
     try {
       final responseJson = await _api.Fetchtransactionfilter(email, userId, authToken);
       print("Raw API Response: $responseJson"); // Debugging
       return FetchTransactionFilter.fromJson(responseJson);
     } catch (e) {
       print("Error in fetchTransactionFilterRep: $e");
       rethrow; // Re-throw for handling in controller
     }
   }

   Future<Clearsavedfilter> Clearsavedfilterrep(
       String email, int userId, String authToken) async {
     try {
       final responseJson = await _api.Clearsavedfilter(email, userId, authToken);
       print("Raw API Response: $responseJson"); // Debugging
       return Clearsavedfilter.fromJson(responseJson);
     } catch (e) {
       print("Error in fetchTransactionFilterRep: $e");
       rethrow; // Re-throw for handling in controller
     }
   }

 }
