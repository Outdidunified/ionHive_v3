import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useAddManageReseller from '../../hooks/ManageReseller/AddManageResellerHooks';
import LoadingButton from '../../../../utils/LoadingButton';
import InputField from '../../../../utils/InputField';
const AddManageReseller = ({ userInfo, handleLogout }) => {
  const {
    reseller_name, setResellerName,
    phoneNumber, setPhoneNumber,
    reseller_email_id, setEmailID,
    reseller_address, setAddress,
    errorMessage, loading,
    addManageReseller, backManageReseller
  } = useAddManageReseller(userInfo);



  return (
    <div className='container-scroller'>
      {/* Header */}
      <Header userInfo={userInfo} handleLogout={handleLogout} />
      <div className="container-fluid page-body-wrapper">
        {/* Sidebar */}
        <Sidebar />
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-md-12 grid-margin">
                <div className="row">
                  <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                    <h3 className="font-weight-bold">Add Manage Reseller</h3>
                  </div>
                  <div className="col-12 col-xl-4">
                    <div className="justify-content-end d-flex">
                      <button type="button" className="btn btn-success" onClick={backManageReseller}>Back</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 grid-margin stretch-card">
                <div className="card">
                  <div className="card-body">
                    <div className="col-12 grid-margin">
                      <div className="card">
                        <div className="card-body">
                          <h4 className="card-title">Manage Reseller</h4>
                          <form className="form-sample" onSubmit={addManageReseller}>
                            <div className="row">
                              {/* Reseller Name */}
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label className="col-form-label labelInput">Reseller Name</label>
                                  <InputField
                                    placeholder="Reseller Name"
                                    value={reseller_name}
                                    maxLength={25}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, '');
                                      setResellerName(sanitizedValue);
                                    }}
                                    required
                                  />
                                </div>
                              </div>

                              {/* Phone Number */}
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label className="col-form-label labelInput">Phone Number</label>
                                  <InputField
                                    placeholder="Phone Number"
                                    value={phoneNumber}
                                    maxLength={10}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      const sanitizedValue = value.replace(/[^0-9]/g, '');
                                      setPhoneNumber(sanitizedValue);
                                    }}
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="row">
                              {/* Email ID */}
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label className="col-form-label labelInput">Email ID</label>
                                  <InputField
                                    type="email"
                                    placeholder="Email ID"
                                    value={reseller_email_id}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      const noSpaces = value.replace(/\s/g, '');
                                      const validChars = noSpaces.replace(/[^a-zA-Z0-9@.]/g, '');
                                      const lowerCaseEmail = validChars.toLowerCase();
                                      const atCount = (lowerCaseEmail.match(/@/g) || []).length;
                                      const sanitizedEmail = atCount <= 1 ? lowerCaseEmail : lowerCaseEmail.replace(/@.*@/, '@');
                                      setEmailID(sanitizedEmail);
                                    }}
                                    required
                                  />
                                </div>
                              </div>

                              {/* Address */}
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label className="col-form-label labelInput">Address</label>
                                  <InputField
                                    placeholder="Address"
                                    value={reseller_address}
                                    maxLength={150}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {errorMessage && <div className="text-danger">{errorMessage}</div>}
                            <br />

                            <LoadingButton
                              type="submit"
                              loading={loading}
                              disabled={loading}
                            >
                              Add
                            </LoadingButton>

                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AddManageReseller