public class BillingRuleLwcController {
    
    @AuraEnabled(cacheable=true)
    public static List<Billing_Rule__c> getBillingRuleRecords(String parentBillRuleId){
        List<Billing_Rule__c>  theBillRuleList = [SELECT Id, Operator__c, FieldDateType__c, Value__c, RuleType__c, Field_Label__c, Variable__c FROM Billing_Rule__c WHERE Billing_Record__c =:parentBillRuleId];
        return theBillRuleList;
    }
    
    @AuraEnabled
    public static List<PickValueWrapper> getPicklistValues(String ObjectApiName, String FieldApiName){
        List<PickValueWrapper> thePickWrapperList = new List<PickValueWrapper>();
        
        if(ObjectApiName != null && FieldApiName !=null){
            if(ObjectApiName.contains('.')) ObjectApiName = ObjectApiName.substringAfterLast('.');
            
            Schema.SObjectType objSobjectType = Schema.getGlobalDescribe().get(ObjectApiName) ;
            
            Schema.DescribeSObjectResult objDescribeSobject = objSobjectType.getDescribe() ;
            Map<String,Schema.SObjectField> fields = objDescribeSobject.fields.getMap() ;
            Schema.DescribeFieldResult fieldResult = fields.get(FieldApiName).getDescribe();
            List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
            for( Schema.PicklistEntry pickListVal : ple){
                PickValueWrapper thePick = new PickValueWrapper();
                thePick.label = pickListVal.getLabel();
                thePick.value = pickListVal.getLabel();
                thePickWrapperList.add(thePick);
            }     
        }
        System.debug('thePickWrapperList::: '+thePickWrapperList);
        return thePickWrapperList;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<LabelNameWrapper> getObjectFieldsLabel(String sObjectName){
        if(sObjectName=='Owner' || sObjectName=='CreatedBy' || sObjectName=='LastModifiedBy'){
            sObjectName = 'User';
        }
        
        List<LabelNameWrapper> theWrapList = new List<LabelNameWrapper>();
        List<String> theLabelList = new List<String>();
        Map<String, Schema.SObjectType> detail = Schema.getGlobalDescribe();
        for(Schema.SObjectField fields : detail.get(sObjectName).getDescribe().fields.getMap().values()) {
            Schema.DescribeFieldResult fieldResult = fields.getDescribe();
          
                if(((sObjectName != 'Opportunity' || sObjectName != 'OpportunityLineItem') && String.valueOf(fields.getDescribe().getType()) != 'REFERENCE') || (sObjectName == 'Opportunity' || sObjectName == 'OpportunityLineItem')){
                    if(String.valueOf(fields.getDescribe().getType()) != 'TEXTAREA'){
                    LabelNameWrapper theWrap = new LabelNameWrapper();
                    theWrap.label= fields.getDescribe().getLabel();
                    theWrap.value= fields.getDescribe().getName();
                    theWrap.type= String.valueOf(fields.getDescribe().getType());
                    theWrapList.add(theWrap); 
                    }
                }  
        }
        System.debug('theWrapList:::'+theWrapList);
        return theWrapList;
    } 
   
     public class PickValueWrapper{
        @AuraEnabled
        public string label {get;set;}
        @AuraEnabled
        public string value {get;set;}
    }
    
    
    public class LabelNameWrapper{
        @AuraEnabled
        public string label {get;set;}
        @AuraEnabled
        public string value {get;set;}
        @AuraEnabled
        public string type {get;set;} 
    }
    
     @AuraEnabled
    public static void deleteBillingRule(String billId){
        delete [SELECT Id FROM Billing_Rule__c WHERE Id =: billId];
    }
    
    @AuraEnabled
    public static void createBillingRule(List<FieldValueWrapper> billingRuleDetails){
        System.debug('billingRuleDetails:::'+billingRuleDetails);
        
        List<Billing_Rule__c> theBillRuleList = new List<Billing_Rule__c>();
        
        for(FieldValueWrapper theFVWrap: billingRuleDetails){
            Billing_Rule__c theBillRule = new Billing_Rule__c();
            
            if(theFVWrap.billRuleId != null) theBillRule.Id = theFVWrap.billRuleId;
            theBillRule.Field_Label__c = theFVWrap.fieldName;
            theBillRule.Value__c = theFVWrap.value ;
            theBillRule.Operator__c = theFVWrap.operate;
            theBillRule.Variable__c = theFVWrap.isVariable;
            if(theFVWrap.rullType == 'Opportunity Rule'){
                  theBillRule.RuleType__c = 'Opportunity';
                 }else{
                  theBillRule.RuleType__c= 'Opportunity Product';
                  }
           if(theFVWrap.billRuleId == null) theBillRule.Billing_Record__c = theFVWrap.parentBillRecord; 
            theBillRule.FieldDateType__c = theFVWrap.fieldDataType;
            theBillRuleList.add(theBillRule);
        }
        if(!theBillRuleList.isEmpty()) upsert theBillRuleList;
    }
    
    public class FieldValueWrapper{
              
        @AuraEnabled
        public string billRuleId {get;set;}                              
        @AuraEnabled
        public string rullType {get;set;}
        @AuraEnabled
        public string fieldName {get;set;}
        @AuraEnabled
        public string value {get;set;}
        @AuraEnabled
        public string operate {get;set;} 
        @AuraEnabled 
        public string parentBillRecord {get;set;} 
        @AuraEnabled
        public boolean isVariable {get;set;} 
        @AuraEnabled 
        public string fieldDataType {get;set;} 
    }    
}