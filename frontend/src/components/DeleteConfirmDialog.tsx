import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash } from 'lucide-react';
import { Button } from './ui/button';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    itemType?: string;
}

export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    itemType = 'item'
}: DeleteConfirmDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Confirm Deletion</h2>
                            </div>
                            
                            <div className="space-y-3 mb-6">
                                <p className="text-gray-700 dark:text-gray-200 font-semibold text-lg leading-tight">
                                    {title}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {description || `Are you sure you want to delete this ${itemType.toLowerCase()}? This action is permanent and cannot be undone.`}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="rounded-xl px-5 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className="rounded-xl px-5 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Trash className="h-4 w-4" />
                                    Delete {itemType}
                                </Button>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-red-600" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
