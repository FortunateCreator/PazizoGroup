import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { sendStatusUpdateSMS } from '../services/smsService';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  getOrder: (orderId: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pazizo_orders');
    return saved ? JSON.parse(saved).map((o: any) => ({
      ...o,
      createdAt: new Date(o.createdAt),
      updatedAt: new Date(o.updatedAt)
    })) : [];
  });

  useEffect(() => {
    localStorage.setItem('pazizo_orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = async (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      status: 'Processing',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() } 
        : order
    ));

    // Trigger SMS alert
    try {
      await sendStatusUpdateSMS(orderToUpdate, status);
    } catch (error) {
      console.error('Failed to send SMS alert:', error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const getOrder = (orderId: string) => {
    return orders.find(o => o.id === orderId);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, deleteOrder, getOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
}
