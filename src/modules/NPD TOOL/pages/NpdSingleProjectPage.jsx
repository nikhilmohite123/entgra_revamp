import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, User, CheckCircle2, Box, Layers, Image as ImageIcon } from 'lucide-react';
import styles from '../styles/npdSingleProject.module.css';
import NpdHeader from '../components/NpdHeader';
import { BASE_URL } from '../constants/npdConstants';

const DEFAULT_PROJECT = {
  s_project_no: '020IN2526',
  s_project_name: 'Oval combi prototype',
  s_region: 'AMESA',
  s_country: 'INDIA',
  s_targated_customer: 'Zydus and Lotus herbal',
  s_segment: 'B&C',
  s_component: 'Yes',
  s_business_back:
    'Considering the interest from two potential customers, Lotus Herbal and Zydus, for the 50dia Oval tubes, we need to evaluate whether we are willing to proceed with this initiative. Believe this could be an opportunity to strengthen our portfolio & position not only with these customers but will also encourage other customers to transition their portfolio to Oval tubes, presenting broader growth opportunity.',
  s_status: 'Mould Sample/ Approval',
  s_expected_com: '2.5 Mn / Annum',
  s_value_propotion: '50dia Oval samples produced and given to marketing team',
  s_tube_spec: '50dia oval/75mm length/7.2mm orifice',
  s_tool_inv_detail: 'EPL invested',
  s_owner: 'Adolf Soans',
  bindemail_technical_con: 'adolf.soans@eplglobal.com',
  s_business_contact: 'Ritesh Patel',
  bindemail_business_con: 'ritesh.patel@eplglobal.com',
  new_file_names: '',
  file_paths: '',
};

export default function NpdSingleProjectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id') || searchParams.get('projectId') || '';

  const [project, setProject] = useState(DEFAULT_PROJECT);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const baseUrl = BASE_URL;

  useEffect(() => {
    let isMounted = true;

    const fetchProjectData = async () => {
      setLoading(true);
      setImgError(false);

      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        let response;
        try {
          response = await fetch(`${baseUrl}/npd/get_data_to_display`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: projectId }),
          });
        } catch {
          // fallback to relative path if absolute port fails
          response = await fetch('/bpmn/npd/get_data_to_display', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: projectId }),
          });
        }

        if (response && response.ok) {
          const result = await response.json();
          if (isMounted && result && result.data && result.data.length > 0) {
            setProject(result.data[0]);
          }
        }
      } catch (err) {
        console.warn('Notice: Using default/fallback project details:', err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProjectData();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/npd_tool/npdtrack_landing_page');
    }
  };

  // Image source calculation
  let drawingImageSrc = null;
  if (!imgError) {
    const rawFileName =
      project.new_file_names ||
      project.s_npd_new_file_name ||
      project.s_file_name ||
      '';
    if (rawFileName) {
      const fileName = rawFileName.split(',')[0].trim();
      let rawPath = project.file_paths || project.s_path || '/NPD_uploads';
      let cleanPath = rawPath.split(',')[0].trim();
      cleanPath = cleanPath.replace(/^\/bpmn\/NPD_uploads/i, '/NPD_uploads');
      if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
      if (cleanPath.endsWith('/')) cleanPath = cleanPath.slice(0, -1);

      const backendOrigin = BASE_URL;

      drawingImageSrc = fileName.startsWith('http')
        ? fileName
        : `${backendOrigin}${cleanPath}/${fileName}`;
    }
  }

  return (
    <div>
      {/* NPD Header */}
      <NpdHeader />

      {/* Main Container */}
      <div className={styles.detailsPage}>
        <div className={styles.detailsContainer}>
          {/* Back Button */}
          <button type="button" className={styles.backBtn} onClick={goBack}>
            <ArrowLeft size={16} />
            <span>Back to Overview</span>
          </button>

          {loading ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <span>Loading Product Specification Sheet...</span>
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div className={styles.headerSection}>
                <div className={styles.trackingTool}>NPD TRACKING TOOL</div>
                <div className={styles.headerContent}>
                  <div className={styles.projectId}>
                    Project: <span>{project.s_project_no || 'N/A'}</span>
                  </div>
                  <h1 className={styles.productTitle}>
                    {project.s_project_name || 'Product Specification'}
                  </h1>

                  <ul className={styles.specList}>
                    <li className={styles.specItem}>
                      <span className={styles.specLabel}>Region / Country : </span>
                      <span className={styles.specValue}>
                        {(project.s_region || 'N/A') + ' / ' + (project.s_country || 'N/A')}
                      </span>
                    </li>
                    <li className={styles.specItem}>
                      <span className={styles.specLabel}>Targeted Customer : </span>
                      <span className={styles.specValue}>
                        {project.s_targated_customer || 'N/A'}
                      </span>
                    </li>
                    <li className={styles.specItem}>
                      <span className={styles.specLabel}>Product Segment : </span>
                      <span className={styles.specValue}>
                        {project.s_segment || 'N/A'}
                      </span>
                    </li>
                    <li className={styles.specItem}>
                      <span className={styles.specLabel}>Component : </span>
                      <span className={styles.specValue}>
                        {project.s_component || 'N/A'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Drawing Section */}
              <div className={styles.drawingSection}>
                <div className={styles.drawingContainer}>
                  <div className={styles.technicalDrawing}>
                    {drawingImageSrc ? (
                      <img
                        src={drawingImageSrc}
                        alt={project.s_project_name || 'Technical Drawing'}
                        className={styles.drawingImage}
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className={styles.drawingPlaceholder}>
                        <ImageIcon size={44} color="#94a3b8" />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>
                          Technical Drawing / Image Placeholder
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                          File: {project.new_file_names || 'Standard CAD / Drawing Spec'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Impact Section */}
              <div className={styles.businessImpact}>
                <h3 className={styles.sectionTitle}>
                  <CheckCircle2 size={18} color="#027a76" />
                  <span>Business Impact :</span>
                </h3>
                <p className={styles.impactText}>
                  {project.s_business_back || 'No description available.'}
                </p>
              </div>

              {/* Project Details Section */}
              <div className={styles.projectDetailsSection}>
                <h3 className={styles.sectionTitle}>
                  <Layers size={18} color="#027a76" />
                  <span>Project Details</span>
                </h3>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Project stage :</span>
                  <span className={styles.detailValue}>{project.s_status || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Expected Completion / Volume :</span>
                  <span className={styles.detailValue}>{project.s_expected_com || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Remarks :</span>
                  <span className={styles.detailValue}>{project.s_value_propotion || 'N/A'}</span>
                </div>
              </div>

              {/* Specifications and Manufacturing */}
              <div className={styles.specsContainer}>
                <div className={styles.specSection}>
                  <h4>
                    <Box size={16} style={{ display: 'inline', marginRight: 6 }} />
                    Product Technical Specs
                  </h4>
                  <div className={styles.specItemDetail}>
                    <strong>Tube Spec :</strong>
                    <span>{project.s_tube_spec || 'N/A'}</span>
                  </div>
                </div>

                <div className={styles.specSection}>
                  <h4>
                    <Layers size={16} style={{ display: 'inline', marginRight: 6 }} />
                    Manufacturing & Tooling
                  </h4>
                  <div className={styles.specItemDetail}>
                    <strong>Tool investment details :</strong>
                    <span>{project.s_tool_inv_detail || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className={styles.contactsContainer}>
                <div className={styles.contactSection}>
                  <h4>
                    <User size={16} />
                    <span>Technical Contact</span>
                  </h4>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Name :</span>
                    <span className={styles.contactValue}>{project.s_owner || 'N/A'}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Email :</span>
                    <span className={styles.contactValue}>
                      {project.bindemail_technical_con ? (
                        <a href={`mailto:${project.bindemail_technical_con}`}>
                          {project.bindemail_technical_con}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </span>
                  </div>
                </div>

                <div className={styles.contactSection}>
                  <h4>
                    <Mail size={16} />
                    <span>Business Contact</span>
                  </h4>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Name :</span>
                    <span className={styles.contactValue}>{project.s_business_contact || 'N/A'}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Email :</span>
                    <span className={styles.contactValue}>
                      {project.bindemail_business_con ? (
                        <a href={`mailto:${project.bindemail_business_con}`}>
                          {project.bindemail_business_con}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
