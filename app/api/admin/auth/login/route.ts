// app/api/admin/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma'; // Usando tu cliente Prisma centralizado

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validación básica - mismo estilo que usas en products/base
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario con roles - usando tu patrón de consultas
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Verificar usuario y contraseña
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña con bcrypt
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar rol admin - mismo patrón de verificación que usas
    const userRoles = user.roles.map(ur => ur.role.name);
    const isAdmin = userRoles.includes('admin');
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'No tiene permisos de administrador' },
        { status: 403 }
      );
    }

    // Respuesta exitosa - mismo formato que tus otros endpoints
    return NextResponse.json({
      success: true,
      data: {
        token: `admin_${user.id}_${Date.now()}`, // Temporal - Módulo 2 será JWT
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          roles: userRoles
        }
      }
    });

  } catch (error) {
    // Manejo de errores igual que en products/base
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}