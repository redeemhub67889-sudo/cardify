// Supabase Client Configuration for Cardify
const SUPABASE_URL = 'https://bvtlhwhfkcpvnxnhhvat.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dGxod2hma2Nwdm54bmhodmF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU3NzU4OTUsImV4cCI6MjExMTM1MTg5NX0.8cw91_K4JhvAjyszcHfq7YXQaQRRYwlKvYACGaQ4MZA';

// Initialize Supabase client
const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other modules
window.supabase = supabase;

// Auth helpers
window.authHelpers = {
  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helpers
window.dbHelpers = {
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getProduct(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    return { data, error };
  },

  async createOrder(orderData, items) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    if (orderError) return { data: null, error: orderError };
    
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price
    }));
    
    const { data: orderItemsData, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();
    
    return { data: { order, orderItems: orderItemsData }, error: itemsError };
  },

  async getUserOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(title, image_url))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(full_name, email), order_items(*, products(*))')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async updateOrderStatus(orderId, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select();
    return { data, error };
  },

  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    return { data, error };
  },

  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select();
    return { data, error };
  },

  async deleteProduct(id) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    return { data, error };
  }
};