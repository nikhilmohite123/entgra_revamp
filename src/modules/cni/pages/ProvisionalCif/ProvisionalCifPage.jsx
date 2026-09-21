import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useProvisionalCif } from '../../hooks/useProvisionalCif';
import { CniLoader } from '../../components/common';
import styles from '../../styles/cni.module.css';

export function ProvisionalCifPage({ isViewOnly = false }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const { 
    item, 
    isLoading, 
    submitProvisionalCif, 
    isSubmitting 
  } = useProvisionalCif(projectId);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  
  React.useEffect(() => {
    if (item && Object.keys(item).length > 0) {
      reset({
        ...item,
        d_pcif_reles_date: item.d_pcif_reles_date ? item.d_pcif_reles_date.split('T')[0] : '',
      });
    }
  }, [item, reset]);

  const tempFiles = [];
  const uploadFile = async (file) => {};
  const removeFile = async (id) => {};

  const onSubmit = async (data) => {
    if (isViewOnly) return;
    try {
      await submitProvisionalCif(data);
      navigate('/cni/dashboard');
    } catch (err) {
      alert("Failed to submit Provisional CIF: " + err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <CniLoader />;

  const isView = isViewOnly || item.s_action_perform === "View" || item.s_action_perform === "V&E";
  const disabled = isView || isViewOnly;

  const showOtherSpec = watch('s_other_altr_check') == '1';

  return (
    <div className={`container ${styles.pageContainer}`}>
      <div className="panel panel-default">
        <div className="panel-body">
          <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)}>
            <h4><span className="label label-primary">Provisional CIF Form</span></h4>
            <div className="col-md-12">
              <div className="col-sm-4">
                Project Name: <b>{item.s_project_name}</b>
              </div>
              <div className="col-sm-4">
                Project No: <b>{item.s_new_project_id}</b>
              </div>
            </div>
            <div className="col-sm-12"><hr className="hrTag noprint" /></div>

            <div className="form-group">
              <label className="control-label col-sm-4"><small>Internal / External (Elaborate Where Required)</small></label>
              <div className="col-sm-4">
                <input 
                  className="form-control input-sm"
                  type="text"
                  {...register('s_ext_int_elaborate', { required: 'Required' })}
                  placeholder="Internal / External"
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="col-sm-12"><hr className="hrTag noprint" /></div>
            
            <div className="col-md-12">
              <label className="control-label"><small>Nature of Change (Tick Relevant) :</small></label>
            </div>

            <div className="col-md-12">
              <div className="col-md-6">
                <label className="col-sm-4 control-label small">Key Material Change</label>
                <div className="col-sm-2">
                  <input type="checkbox" {...register('s_key_material_check')} disabled={disabled} />
                </div>
              </div>
              <div className="col-md-6">
                <label className="col-sm-4 control-label small">Product Warehouse location</label>
                <div className="col-sm-2">
                  <input type="checkbox" {...register('s_pro_warehouse_check')} disabled={disabled} />
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="col-md-6">
                <label className="col-sm-4 control-label small">Manufacturing Capability</label>
                <div className="col-sm-2">
                  <input type="checkbox" {...register('s_manu_capa_check')} disabled={disabled} />
                </div>
              </div>
              <div className="col-md-6">
                <label className="col-sm-4 control-label small">Product Specification</label>
                <div className="col-sm-2">
                  <input type="checkbox" {...register('s_prod_speci_check')} disabled={disabled} />
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="col-md-6">
                <label className="col-sm-4 control-label small">Site of Manufacture</label>
                <div className="col-sm-2">
                  <input type="checkbox" {...register('s_site_of_manu_check')} disabled={disabled} />
                </div>
              </div>
              <div className="col-md-6">
                <label className="col-sm-4 control-label small">Transportation Method</label>
                <div className="col-sm-2">
                  <input type="checkbox" {...register('s_trans_method_check')} disabled={disabled} />
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="col-md-6">
                <label className="col-sm-4 control-label small">Production Process</label>
                <div className="col-sm-2">
                  <input type="checkbox" {...register('s_produ_process_check')} disabled={disabled} />
                </div>
              </div>
              <div className="col-md-6">
                <label className="col-sm-4 control-label small">Others <small>(specify) Alternate Material</small></label>
                <div className="col-sm-2">
                  <input type="checkbox" {...register('s_other_altr_check')} disabled={disabled} />
                </div>
                {showOtherSpec && (
                  <input 
                    type="text"
                    className="form-control input-sm"
                    {...register('s_other_altr_value', { required: 'Required' })}
                    placeholder="Other (specify) Alternate Material"
                    disabled={disabled}
                  />
                )}
              </div>
            </div>

            <div className="col-sm-12"><hr className="hrTag noprint" /></div>

            <div className="form-group">
              <label className="control-label col-sm-4"><small>Current Practice</small></label>
              <div className="col-sm-4">
                <textarea 
                  className="form-control input-sm"
                  {...register('s_current_practice', { required: 'Required', maxLength: 5000 })}
                  placeholder="Current Practice..."
                  disabled={disabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="control-label col-sm-4"><small>New Practice</small></label>
              <div className="col-sm-4">
                <textarea 
                  className="form-control input-sm"
                  {...register('s_new_practice', { required: 'Required', maxLength: 5000 })}
                  placeholder="New Practice..."
                  disabled={disabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="control-label col-sm-4"><small>Associated Changes Required</small></label>
              <div className="col-sm-4">
                <input 
                  className="form-control input-sm"
                  type="text"
                  {...register('s_associated_chang', { required: 'Required' })}
                  placeholder="Associated Changes..."
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="control-label col-sm-4"><small>Remark</small></label>
              <div className="col-sm-4">
                <textarea 
                  className="form-control input-sm"
                  {...register('s_recommendation', { required: 'Required', maxLength: 5000 })}
                  placeholder="Remark..."
                  disabled={disabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="col-md-12">
              <label className="control-label">
                <span className="small" style={{ color: 'blue' }}>All the users need to amend necessary documents like SRD, BOM etc.</span>
              </label>
              <hr />
            </div> 

            <div className="form-group">
              <label className="control-label col-sm-4">Release Date</label>
              <div className="col-sm-4">
                <input 
                  type="date"
                  className="form-control input-sm"
                  {...register('d_pcif_reles_date', { required: 'Required' })}
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="col-md-12">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tempFiles.map((file, i) => (
                    <tr key={i}>
                      <td>{file.name}</td>
                      <td>
                        {!disabled && (
                          <button type="button" onClick={() => removeFile(file.id)}>Remove</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!disabled && (
                <div style={{ marginTop: '10px' }}>
                  <input type="file" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      uploadFile(e.target.files[0]);
                    }
                  }} />
                </div>
              )}
            </div>

            <div className="col-md-12" style={{ marginTop: '20px' }}>
              <span className="pull-right">
                {!disabled && tempFiles.length > 0 && (
                  <button type="submit" className="btn btn-sm btn-success" disabled={isSubmitting}>
                    {isSubmitting ? 'Approving...' : 'Approve & Pass to Stage 5'}
                  </button>
                )}
                <button type="button" className="btn btn-warning btn-sm" onClick={handlePrint} style={{ marginLeft: '10px' }}>Print</button>
                <button type="button" className="btn btn-default btn-sm" onClick={() => navigate('/cni/dashboard')} style={{ marginLeft: '10px' }}>Back</button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
