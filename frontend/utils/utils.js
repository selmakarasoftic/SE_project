let Utils = {
  // For creating and managing DataTables
  datatable: function (table_id, columns, data, pageLength = 15) {
    if ($.fn.dataTable.isDataTable("#" + table_id)) {
      $("#" + table_id)
        .DataTable()
        .destroy();
    }
    $("#" + table_id).DataTable({
      data: data,
      columns: columns,
      pageLength: pageLength,
      lengthMenu: [2, 5, 10, 15, 25, 50, 100, "All"],
      responsive: true,
      language: {
        emptyTable: "No records available",
        zeroRecords: "No matching records found",
        info: "Showing _START_ to _END_ of _TOTAL_ entries",
        search: "Search records:"
      },
      createdRow: function(row, data, dataIndex) {
        if (data.status) {
          switch(data.status.toLowerCase()) {
            case 'pending':
              $(row).addClass('table-warning');
              break;
            case 'confirmed':
              $(row).addClass('table-success');
              break;
            case 'cancelled':
              $(row).addClass('table-danger');
              break;
          }
        }
        
        if (data.progress) {
          const progress = parseInt(data.progress);
          if (progress >= 80) {
            $(row).addClass('table-success');
          } else if (progress >= 50) {
            $(row).addClass('table-warning');
          } else {
            $(row).addClass('table-danger');
          }
        }
      }
    });
  },

  // For handling JWT tokens
  parseJwt: function(token) {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      console.error("Invalid JWT token", e);
      return null;
    }
  },

  // For formatting dates in a user-friendly way
  formatDate: function(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // For formatting dates with time
  formatDateTime: function(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // For getting current user info
  getUser: function() {
    const token = localStorage.getItem('user_token');
    if (!token) return null;
    return this.parseJwt(token);
  },

  // For getting user role
  getUserRole: function() {
    const user = this.getUser();
    return user ? user.role : null;
  },

  // Role check functions
  isAdmin: function() {
    return this.getUserRole() === 'admin';
  },

  isGuest: function() {
    return this.getUserRole() === 'guest';
  },

  // For user logout
  logout: function() {
    localStorage.removeItem('user_token');
    window.location.href = '/login.html';
  },

  // For showing notifications
  showSuccess: function(message) {
    toastr.success(message);
  },

  showError: function(message) {
    toastr.error(message);
  },

  showWarning: function(message) {
    toastr.warning(message);
  },

  showInfo: function(message) {
    toastr.info(message);
  },

  // For form validation
  validateEmail: function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePassword: function(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
  },

  // For handling file uploads in gallery
  formatFileSize: function(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileExtension: function(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  },

  isImageFile: function(filename) {
    const ext = this.getFileExtension(filename).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  },

  // For security: prevents attacks when displaying user input, for exampl someone can write some script that could steal the users 
  //token and use it to access the user's account and that is why we need to sanitize the input 
  sanitizeHTML: function(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }
}; 
export default Utils;