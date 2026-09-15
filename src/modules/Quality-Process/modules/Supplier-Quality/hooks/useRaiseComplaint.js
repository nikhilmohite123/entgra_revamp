import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../../../context/AuthContext';
import { 
  getDefectTypes, 
  getNatureOfDefect, 
  getComplaintById, 
  saveComplaint 
} from '../../../services/supplierQualityService';
import { 
  getCurrentFiscalYear, 
  getCurrentMonth, 
  getCurrentYear, 
  getCurrentCalendarMonthName 
} from '../utils/dateUtils';

export const useRaiseComplaint = (mode = 'create', complaintId = null) => {
  const { userId } = useAuth();
  
  const [defectTypes, setDefectTypes] = useState([]);
  const [natureOfDefects, setNatureOfDefects] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [initialDataLoading, setInitialDataLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors }
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      s_supplir_cate: '',
      s_defect_type: '',
      s_natur_complnt: '',
      n_lot_qnty: 0,
      n_accpt_qnty: 0,
      n_complaint_qnty: 0,
      n_incoming: 0,
      n_inprocess: 0,
      comp_samp: false,
      credit_note: false,
      '8D_report': false,
      plant_visit: false,
      replce_mat8D_report: false,
      s_add_sorting_cost: false,
    }
  });

  const selectedCategory = watch('s_supplir_cate');
  const selectedDefectType = watch('s_defect_type');
  const incomingQty = watch('n_incoming') || 0;
  const inprocessQty = watch('n_inprocess') || 0;

  // Custom validation rule for Complaint Qty
  const validateComplaintQty = (value) => {
    const totalBlocked = Number(incomingQty) + Number(inprocessQty);
    if (Number(value) !== totalBlocked) {
      return 'Complaint Qty should be = Blocked Incoming + Blocked In process. Please select Qty accordingly to move ahead';
    }
    return true;
  };

  // Edit Mode Initialization
  useEffect(() => {
    if (mode === 'edit' && complaintId) {
      setInitialDataLoading(true);
      const controller = new AbortController();
      
      const fetchInitialData = async () => {
        try {
          const data = await getComplaintById(complaintId, controller.signal);
          
          // Map backend response directly to form default values.
          // Adjust mappings here if necessary.
          reset({
            s_noti_no: data.s_noti_no || data.s_dms_supplr_cmplt_no,
            s_plant: data.s_plant,
            s_supplir_cate: data.s_supplir_cate,
            s_supplier_category: data.s_supplier_category,
            s_supplir_name: data.s_supplir_name,
            s_vender_code: data.s_vender_code,
            s_mat_code: data.s_mat_code,
            s_mat_name: data.s_mat_name,
            s_inspection_lot_no: data.s_inspection_lot_no,
            s_invoice_no: data.s_invoice_no,
            s_date_of_invoice: data.s_invoice_date,
            s_date_of_receipt: data.s_receipt_date,
            s_gir_doc_no: data.s_gir_doc_no,
            
            n_lot_qnty: data.n_lot_qnty,
            n_accpt_qnty: data.n_accpt_qnty,
            n_complaint_qnty: data.n_complaint_qty,
            
            s_defect_type: data.s_defect_type,
            s_natur_complnt: data.s_natur_complnt,
            s_complnt_type: data.s_complnt_type === 'NULL' ? '' : data.s_complnt_type,
            s_bussi_centr: data.s_bussi_centr === 'NULL' ? '' : data.s_bussi_centr,
            s_supplir_risk_assmnt: data.s_supplir_risk_assmnt === 'NULL' ? '' : data.s_supplir_risk_assmnt,
            s_resp_timeline: data.s_resp_timeline === 'NULL' ? '' : data.s_resp_timeline,
            
            s_complnt_descrip: data.s_complnt_descrip,
            s_test_method_use: data.s_test_method_use,
            
            s_uom: data.s_uom === 'NULL' ? '' : data.s_uom?.toUpperCase(),
            n_incoming: data.n_incoming === 'NULL' ? 0 : data.n_incoming,
            n_inprocess: data.n_inprocess === 'NULL' ? 0 : data.n_inprocess,
            n_total: data.n_total,
            
            s_unit_price: data.s_unit_price ? parseFloat(data.s_unit_price) : 0,
            s_currency: data.s_currency === 'NULL' ? '' : data.s_currency,
            s_downtime_loss: data.s_downtime_loss,
            n_sorting_cost: data.n_sorting_cost,
            s_add_sorting_cost: data.s_add_sorting_cost == 1,
            s_valu_complnt: data.s_valu_complnt,
            
            comp_samp: data.n_complnt_smpl_sent == 1,
            s_cmplnt_sent_date: data.s_cmplnt_sent_date,
            s_CD_no: data.s_CD_no,
            s_CS_providr: data.s_CS_providr,
            
            credit_note: data.credit_note == 1,
            '8D_report': data.s_8DReport == 1,
            plant_visit: data.s_plant_visit == 1,
            d_req_visit: data.d_req_visit,
            replce_mat8D_report: data.s_replce_mat8D_report == 1,
          });

        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Failed to load complaint data for editing', error);
          }
        } finally {
          setInitialDataLoading(false);
        }
      };
      
      fetchInitialData();
      return () => controller.abort();
    }
  }, [mode, complaintId, reset]);

  // CASCADING EFFECT 1: Category -> Defect Type
  useEffect(() => {
    if (!selectedCategory) {
      setDefectTypes([]);
      setValue('s_defect_type', '');
      return;
    }

    const controller = new AbortController();
    const fetchDefects = async () => {
      try {
        const result = await getDefectTypes(selectedCategory, controller.signal);
        setDefectTypes(result || []);
        
        // Reset dependent fields exactly like legacy
        if (mode !== 'edit' || !initialDataLoading) {
          setValue('s_defect_type', '');
        }
      } catch (error) {
        if (error.name !== 'AbortError') console.error(error);
      }
    };

    fetchDefects();
    return () => controller.abort();
  }, [selectedCategory, setValue, mode, initialDataLoading]);

  // CASCADING EFFECT 2: Defect Type -> Nature Of Defect
  useEffect(() => {
    if (!selectedDefectType) {
      setNatureOfDefects([]);
      setValue('s_natur_complnt', '');
      return;
    }

    const controller = new AbortController();
    const fetchNature = async () => {
      try {
        const result = await getNatureOfDefect(selectedDefectType, controller.signal);
        setNatureOfDefects(result || []);
        
        // Reset dependent fields exactly like legacy
        if (mode !== 'edit' || !initialDataLoading) {
          setValue('s_natur_complnt', '');
        }
      } catch (error) {
        if (error.name !== 'AbortError') console.error(error);
      }
    };

    fetchNature();
    return () => controller.abort();
  }, [selectedDefectType, setValue, mode, initialDataLoading]);

  // Form Submission Handler
  const onSubmit = useCallback(async (data) => {
    setLoading(true);
    
    // Calculated static params mimicking legacy structure
    const currentYearNum = getCurrentYear();
    const s_month = getCurrentMonth();
    const s_calendar_month = getCurrentCalendarMonthName();
    const s_fiscalyear = getCurrentFiscalYear(currentYearNum);
    
    // Query param emulation
    const urlParams = new URLSearchParams(window.location.search);
    const currStatus = urlParams.get('status') || '1';

    // Full Payload Mapping matching legacy specifically
    const payload = {
      notificationNo: data.s_noti_no || "",
      plant: data.s_plant,
      plant_name: data.plant_name || "", // Need to derive this from context in Component UI chunk
      supplierCat: data.s_supplir_cate,
      suppliercategory: data.s_supplier_category,
      supplierName: data.s_supplir_name,
      vecdorCode: data.s_vender_code, // maintaining legacy typo
      materialcode: data.s_mat_code,
      materialName: data.s_mat_name,
      batchNo: data.s_inspection_lot_no,
      
      actualLotQty: data.n_lot_qnty,
      complaintQty: data.n_complaint_qnty,
      acceptedQty: data.n_accpt_qnty,
      girDocNo: data.s_gir_doc_no,
      
      defectType: data.s_defect_type,
      natureOfComplaint: data.s_natur_complnt,
      complaintType: data.s_complnt_type,
      bussinessCenter: data.s_bussi_centr, // legacy typo
      supplierRiskAsst: data.s_supplir_risk_assmnt,
      responseTime: data.s_resp_timeline,
      complaintDesc: data.s_complnt_descrip,
      testemathodUse: data.s_test_method_use, // legacy typo
      
      uom: data.s_uom,
      incoming: data.n_incoming,
      inProcess: data.n_inprocess,
      total: data.n_total,
      
      s_unit_price: data.s_unit_price,
      s_downtime_loss: data.s_downtime_loss,
      n_sorting_cost: data.n_sorting_cost,
      valueOfComplaint: data.s_valu_complnt,
      
      conplaintSent: data.comp_samp ? 1 : 0, // legacy typo
      s_credit_note: data.credit_note ? 1 : 0,
      s_8D_report: data['8D_report'] ? 1 : 0,
      plant_visit: data.plant_visit ? 1 : 0,
      d_req_visit: data.d_req_visit,
      replce_mat8D_report: data.replce_mat8D_report ? 1 : 0,
      
      s_cmplnt_sent_date: data.s_cmplnt_sent_date,
      courierDocNo: data.s_CD_no,
      courierServiceprovide: data.s_CS_providr,
      s_invoice_no: data.s_invoice_no,
      s_invoice_date: data.s_date_of_invoice,
      s_receipt_date: data.s_date_of_receipt,
      s_currency: data.s_currency,
      
      status: currStatus,
      s_month,
      s_year: currentYearNum,
      s_calendar_month,
      s_fiscalyear,
      s_add_sorting_cost: data.s_add_sorting_cost ? 1 : 0,
      
      created_by: userId,
    };

    try {
      const response = await saveComplaint(payload); // from service
      const sts = response.sts;
      
      // Simulate toast logging
      if (sts === 1) {
        console.log("Complaint Initiated Successfully. kindly review details in next form and mail details to supplier");
      } else if (sts === 2) {
        console.log("Complaint Raised Successfully.");
      }
      
      // Simulated redirect logging to target CAPA route
      const ncp = response.noti || "";
      console.log(`Redirecting to: /bpmn/ncr_supplier_capa_form/:status=${currStatus}&ncp=${ncp}&edit=edit`);

    } catch (error) {
      console.error("Failed to submit form:", error);
      // Simulate error toast
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    register,
    control,
    handleSubmit,
    onSubmit,
    errors, 
    watch,
    setValue,
    loading,
    initialDataLoading,
    defectTypes,
    natureOfDefects,
    validateComplaintQty
  };
};
