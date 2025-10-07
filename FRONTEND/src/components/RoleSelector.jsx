export default function RoleSelector({ role, onChange, includeAdmin = false }) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
                className="w-full border rounded px-3 py-2"
                value={role.toLowerCase()}
                onChange={e => onChange(e.target.value)}
            >
                <option value="user">User</option>
                <option value="owner">Store Owner</option>
                {includeAdmin && <option value="admin">Admin</option>}
            </select>
        </div>
    );
}


