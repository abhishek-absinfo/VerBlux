public class BillingRecordLwcController {
    
   @AuraEnabled
   public static Id createBillingRecord(BillingRecordWrapper billingDetails) {
       Billing_Record__c theBilRecord;
       
        if(billingDetails != null){
            theBilRecord = new Billing_Record__c();
            if(billingDetails.billingName !=null) theBilRecord.Name = billingDetails.billingName;
            if(billingDetails.billingDescription !=null) theBilRecord.Description__c = billingDetails.billingDescription;
            if(billingDetails.invoiceCounter !=null) theBilRecord.Invoice_Number__c = Integer.valueOf(billingDetails.invoiceCounter); 
            if(billingDetails.invoiceTypeValue !=null) theBilRecord.Invoice_Type__c = billingDetails.invoiceTypeValue;
             System.debug('billingDetails.invoiceDate:::'+billingDetails.invoiceDate);
            if(billingDetails.invoiceDate !=null) theBilRecord.Invoice_Date__c = Date.valueOf(billingDetails.invoiceDate);
            if(billingDetails.selectedTemplateValue !=null) theBilRecord.Default_Invoice_Template__c = billingDetails.selectedTemplateValue;
            if(!billingDetails.selectedContactEmails.isEmpty()) theBilRecord.Additional_Email_Addresses__c = billingDetails.selectedContactEmails[0];
            if(billingDetails.maxInvoiceNumber !=null && billingDetails.maxInvoiceNumber > 0) theBilRecord.Max_Invoice_Number__c = billingDetails.maxInvoiceNumber;
            
            insert theBilRecord;  
        }
        return theBilRecord.Id; 
    } 
    
    public class BillingRecordWrapper {
        @AuraEnabled
        public string billingName {get;set;}  
        @AuraEnabled
        public string billingDescription {get;set;}  
        @AuraEnabled
        public string invoiceCounter {get;set;}  
        @AuraEnabled
        public string invoiceTypeValue {get;set;}  
        @AuraEnabled
        public string invoiceDate {get;set;}  
        @AuraEnabled
        public string selectedTemplateValue {get;set;} 
        @AuraEnabled
        public List<String> selectedContactEmails {get;set;}
        @AuraEnabled
        public Double maxInvoiceNumber {get;set;}
        
    }
    
    @AuraEnabled
    public static UserAndInvoiceNumberWrapper getUser() {
        UserAndInvoiceNumberWrapper theUserInvWrap = new UserAndInvoiceNumberWrapper();
        String UserId = UserInfo.getUserId();
        User theUser = [SELECT Id, Name FROM User WHERE Id=:UserId];
        theUserInvWrap.maxInvoiceNumber  = [SELECT ID, Max_Invoice_Number__c FROM Billing_Record__c order by Max_Invoice_Number__c DESC NULLS LAST LIMIT 1].Max_Invoice_Number__c + 1;
        theUserInvWrap.user  = theUser;
        System.debug('theUserInvWrap:::'+theUserInvWrap);
        return theUserInvWrap;
    }
    
    @AuraEnabled(cacheable = true)
    public static List<Invoice_Template__c> getTemplateList(){
        List<Invoice_Template__c> theTempList = [SELECT Id, Name FROM Invoice_Template__c];
         return theTempList;    
    }
    
     @AuraEnabled(cacheable = true)
    public static List<Contact> fetchContactEmailList(String contId){
        List<Contact> theContactList = [SELECT Id, Email FROM Contact WHERE Id =:contId]; 
        return theContactList;
    }
    
     public class UserAndInvoiceNumberWrapper {
        @AuraEnabled
        public User user {get;set;}  
         @AuraEnabled
        public Double maxInvoiceNumber {get;set;}  
     }
      
}