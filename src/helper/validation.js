import { Validator } from "node-input-validator";
const validation = async (req, res, next) => {
  let path = req.path.toString();
  console.log({ path });
  if (path.includes("/register")) {
    var feilds = {
      email: "required|email",
      password: "required",
      phone: "required",
      countryCode: "required",
    };
  }
  if (path.includes("/isVerify")) {
    var feilds = {
      email: "required|email",
      otpType: "required|in:register,forgotPassword,ChangePassword",
      otp: "required",
    };
  }
  if (path.includes("/resendOtp") || path.includes("/forgotPassword")) {
    var feilds = {
      email: "required|email",
    };
  }
  if (path.includes("/login")) {
    var feilds = {
      password: "required",
      role: "required",
    };
  }
  if (path.includes("/addOrder")) {
    var feilds = {
      amount: "required",
      currency: "required",
    };
  }
  if (path.includes("/updateRound")) {
    var feilds = {
      round: "required",
    };
  }
  if (path.includes("/resetPassword")) {
    var feilds = {
      email: "required|email",
      password: "required",
    };
  }
  if (path.includes("/changePassword")) {
    if (path == "/changePassword") {
      var feilds = {
        newPassword: "required",
      };
    } else {
      var feilds = {
        password: "required",
      };
    }
  }
  if (path.includes("/viewUser")) {
    var feilds = {
      user_id: "required",
    };
  }
  // if (path.includes('/WithdrawReq')) {
  //   var feilds = {

  //   }
  //   feilds.withdrawType="required"
  //   if(req.body.withdrawType&&req.body.withdrawType=='Jaimax'){
  //       feilds.token="required"
  //   }else{
  //     feilds.INR="required"
  //     feilds.currencyType='required'
  //   }

  // }
  if (path.includes("/send_transaction_user")) {
    var feilds = {
      amount: "required|numeric",
      user_id: "required|string",
      transaction_type: "required|in:referral_amount,jaimax,super_bonus",
    };
  }
  if (path.includes("/WithdrawReq")) {
    var feilds = {
      amount: "required|numeric",
      currency: "required|in:INR,USD",
    };
  }
  if (path.includes("/withrawApproval")) {
    var feilds = {
      isApproved: "required|boolean",
      withraw_id: "required|arrayUnique",
    };
  }
  if (path.includes("/reCAPTCHAVerify")) {
    var feilds = {
      response: "required",
    };
  }
  if (path.includes("/purchaseJaimaxCalculate")) {
    var feilds = {
      amount: "required",
      currency: "required",
    };
  }
  if (path.includes("/userBlock")) {
    var feilds = {
      is_blocked: "required",
      user_id: "required",
    };
  }
  if (path.includes("/category_create")) {
    var feilds = {
      category_name: "required",
    };
  }
  if (path.includes("/category_update")) {
    var feilds = {
      category_id: "required",
      category_name: "required",
    };
    req.body.category_id = req.params.id;
  }

  if (path.includes("/category_update")) {
    var feilds = {
      category_id: "required",
    };
    req.body.category_id = req.params.id;
  }
  if (path.includes("/update_ticket")) {
    var feilds = {
      id: "required",
      status: "required",
    };
  }
  if (path.includes("/create_ticket")) {
    var feilds = {
      title: "required",
      content: "required",
      priority: "required",
      category_id: "required",
    };
  }
  if (path.includes("/comment_create")) {
    var feilds = {
      comment: "required|string",
      ticket_id: "required",
    };
  }
  if (path.includes("/submitKyc")) {
    var feilds = {
      // doc_front: "required|string",
      //doc_front1: "required|string",
      bank_name: "required",
      ifsc_code: "required",
      mobile_number: "required",
      // upi_id:"required",
      bank_account: "required",
      address: "required",
    };
    if (req.files && req.files.doc_front && req.files.doc_front1) {
      req.body.doc_front = req.files && req.files.doc_front.name.toString();
      req.body.doc_front1 = req.files && req.files.doc_front1.name;
    }
  }
  if (path.includes("/KycStatusUpdate")) {
    var feilds = {
      id: "required|string",
    };
    if (req.body.status == "reject") {
      feilds.reason = "required|string";
    }
  }
  if (path.includes("/legal_update")) {
    var feilds = {
      legal_text: "required|string",
      id: "required",
    };
  }
  if (path.includes("/create_payment")) {
    var feilds = {
      order_id: "required",
    };
  }
  if (path.includes("/get_order")) {
    var feilds = {
      order_id: "required",
    };
    req.body.order_id = req.query.order_id;
  }
  if (path.includes("/create-admin-user")) {
    var feilds = {
      name: "required",
      email: "required",
      password: "required",
      permissions: "required",
      phone: "required",
      countryCode: "required",
    };
  }
  if (path.includes("/edit-admin-user")) {
    var feilds = {
      name: "required",
      permissions: "required",
      phone: "required",
      countryCode: "required",
    };
  }
  if (path.includes("/addTransaction")) {
    var feilds = {
      transactionId: "required|string",
      transactionAmount: "required|numeric|min:1",
    };
  }

  //share holder

  if (path.includes("/user-eligibilty-shareholder")) {
    var feilds = {
      username: "required",
    };
  }
  

  

  const v = new Validator(req.body, feilds);
  v.check()
    .then((matched) => {
      if (!matched) {
        return res.status(400).send(v.errors);
      } else {
        next();
      }
    })
    .catch(console.log);
};

export default validation;