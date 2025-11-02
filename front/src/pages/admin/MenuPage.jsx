import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { mealsAPI } from "@/lib/api";
import { showError, showSuccess } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit2,
  Trash2,
  Coffee,
  UtensilsCrossed,
  Moon,
} from "lucide-react";

export default function MenuPage({ className }) {
  const { userProfile } = useAuth();
  const [mealType, setMealType] = useState("breakfast");
  const [addMealDialogOpen, setAddMealDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuForm, setMenuForm] = useState({
    name: "",
    price: "",
    prepTime: "",
  });
  const [editingMeal, setEditingMeal] = useState(null);
  const [editingMealForm, setEditingMealForm] = useState({
    name: "",
    price: "",
    prepTime: "",
    type: "breakfast",
  });
  const [menuItems, setMenuItems] = useState([]);

  // Load meals from API
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const data = await mealsAPI.getAll();
        // Ensure data is always an array
        const mealsData = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setMenuItems(mealsData);
      } catch (err) {
        console.error("Error loading meals:", err);
        setMenuItems([]); // Ensure menuItems is always an array
      }
    };
    loadMeals();
  }, []);

  const handleAddMeal = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!menuForm.name || !menuForm.price || !menuForm.prepTime) {
      showError("Please fill all fields", 'Add Meal');
      setLoading(false);
      return;
    }

    try {
      const newMeal = await mealsAPI.create({
        name: menuForm.name,
        type: mealType,
        price: parseInt(menuForm.price),
        prepTime: menuForm.prepTime,
      });

      setMenuItems([...menuItems, newMeal]);

      // Reset form and close dialog
      setMenuForm({ name: "", price: "", prepTime: "" });
      setAddMealDialogOpen(false);
      showSuccess("Meal added successfully!", 'Add Meal');
    } catch (err) {
      showError(err, 'Add Meal');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMeal = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!editingMealForm.name || !editingMealForm.price || !editingMealForm.prepTime) {
      showError("Please fill all fields", 'Update Meal');
      setLoading(false);
      return;
    }

    try {
      const updatedMeal = await mealsAPI.update(editingMeal._id, {
        name: editingMealForm.name,
        type: editingMealForm.type,
        price: parseInt(editingMealForm.price),
        prepTime: editingMealForm.prepTime,
      });

      setMenuItems(
        menuItems.map((meal) =>
          meal._id === editingMeal._id ? updatedMeal : meal
        )
      );
      setEditingMeal(null);
      setEditingMealForm({
        name: "",
        price: "",
        prepTime: "",
        type: "breakfast",
      });
      showSuccess("Meal updated successfully!", 'Update Meal');
    } catch (err) {
      showError(err, 'Update Meal');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      await mealsAPI.delete(id);
      setMenuItems(menuItems.filter((item) => item._id !== id));
      showSuccess("Meal deleted successfully!", 'Delete Meal');
    } catch (err) {
      showError(err, 'Delete Meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
            <UtensilsCrossed size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm sm:text-xl font-bold text-gray-900">Menu Manager</h2>
            <p className="text-xs text-gray-600 font-medium">Manage your tiffin offerings</p>
          </div>
        </div>

        <Dialog open={addMealDialogOpen} onOpenChange={setAddMealDialogOpen}>
          <button
            onClick={() => setAddMealDialogOpen(true)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:scale-105 active:scale-95"
            disabled={loading}
          >
            <Plus size={14} />
            <span className="hidden sm:inline text-sm">Add Meal</span>
            <span className="sm:hidden text-xs">Add</span>
          </button>
          <DialogContent className="w-[90vw] max-w-md mx-auto border-0 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Plus size={16} className="text-blue-600" />
                </div>
                Add New Meal
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMeal} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Meal Type
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium bg-white"
                >
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">🍽️ Lunch</option>
                  <option value="dinner">🌙 Dinner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Meal Name
                </label>
                <Input
                  type="text"
                  value={menuForm.name}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, name: e.target.value })
                  }
                  placeholder="e.g., Paneer Tikka Masala"
                  className="rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Price (₹)
                  </label>
                  <Input
                    type="number"
                    value={menuForm.price}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, price: e.target.value })
                    }
                    placeholder="150"
                    className="rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Prep Time
                  </label>
                  <Input
                    type="text"
                    value={menuForm.prepTime}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, prepTime: e.target.value })
                    }
                    placeholder="25 mins"
                    className="rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-10 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg font-bold h-10 transition-all duration-300 disabled:opacity-50 shadow-lg text-sm"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </div>
                  ) : (
                    "Add Meal"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Meal Dialog */}
        <Dialog open={!!editingMeal} onOpenChange={() => setEditingMeal(null)}>
          <DialogContent className="w-[90vw] max-w-md mx-auto border-0 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <div className="p-1.5 bg-orange-100 rounded-lg">
                  <Edit2 size={16} className="text-orange-600" />
                </div>
                Edit Meal
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditMeal} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Meal Type
                </label>
                <select
                  value={editingMealForm.type}
                  onChange={(e) =>
                    setEditingMealForm({ ...editingMealForm, type: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium bg-white"
                >
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">🍽️ Lunch</option>
                  <option value="dinner">🌙 Dinner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Meal Name
                </label>
                <Input
                  type="text"
                  value={editingMealForm.name}
                  onChange={(e) =>
                    setEditingMealForm({ ...editingMealForm, name: e.target.value })
                  }
                  placeholder="e.g., Paneer Tikka Masala"
                  className="rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Price (₹)
                  </label>
                  <Input
                    type="number"
                    value={editingMealForm.price}
                    onChange={(e) =>
                      setEditingMealForm({ ...editingMealForm, price: e.target.value })
                    }
                    placeholder="150"
                    className="rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Prep Time
                  </label>
                  <Input
                    type="text"
                    value={editingMealForm.prepTime}
                    onChange={(e) =>
                      setEditingMealForm({ ...editingMealForm, prepTime: e.target.value })
                    }
                    placeholder="25 mins"
                    className="rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 h-10 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-lg font-bold h-10 transition-all duration-300 disabled:opacity-50 shadow-lg text-sm"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </div>
                  ) : (
                    "Update Meal"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Meal Categories */}
      <div className="space-y-4">
        {[
          { type: "breakfast", icon: Coffee, color: "from-yellow-400 to-orange-500", bgColor: "bg-yellow-50", emoji: "🌅" },
          { type: "lunch", icon: UtensilsCrossed, color: "from-green-400 to-blue-500", bgColor: "bg-green-50", emoji: "🍽️" },
          { type: "dinner", icon: Moon, color: "from-purple-400 to-indigo-500", bgColor: "bg-purple-50", emoji: "🌙" }
        ].map(({ type, icon: Icon, color, bgColor, emoji }) => {
          const filteredItems = menuItems.filter(item => item.type === type);
          return (
            <div key={type} className={`${bgColor} rounded-2xl p-4 sm:p-5 shadow-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-1.5 bg-gradient-to-r ${color} rounded-xl shadow-lg`}>
                  <Icon size={14} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 capitalize flex items-center gap-2">
                    <span className="text-sm">{emoji}</span>
                    {type}
                  </h3>
                  <p className="text-xs text-gray-600 font-medium mt-0.5">
                    {filteredItems.length} delicious items available
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-700 bg-white px-3 py-1.5 rounded-full shadow-sm">
                  {filteredItems.length} items
                </span>
              </div>

              {/* Scrollable container for many items */}
              <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <div className="space-y-2">
                  {filteredItems.map((meal) => (
                    <div
                      key={meal._id}
                      className="bg-white rounded-lg p-2.5 sm:p-3 border border-gray-200 flex items-center justify-between hover:shadow-md transition-all duration-300 hover:border-gray-300"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                          {meal.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-green-600 font-bold text-xs">₹{meal.price}</span>
                          <span className="text-gray-500 text-xs">• {meal.prepTime}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 ml-2">
                        <button
                          onClick={() => {
                            setEditingMeal(meal);
                            setEditingMealForm({
                              name: meal.name,
                              price: meal.price.toString(),
                              prepTime: meal.prepTime,
                              type: meal.type,
                            });
                          }}
                          className="p-1.5 hover:bg-blue-50 rounded-md transition-colors group border border-transparent hover:border-blue-200"
                        >
                          <Edit2 size={10} className="text-blue-600 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => handleDeleteMeal(meal._id)}
                          disabled={loading}
                          className="p-1.5 hover:bg-red-50 rounded-md transition-colors group disabled:opacity-50 border border-transparent hover:border-red-200"
                        >
                          <Trash2 size={10} className="text-red-600 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon size={14} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium text-sm">No {type} items added yet</p>
                  <p className="text-gray-400 font-medium mt-1 text-xs">Click "Add" to get started</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
